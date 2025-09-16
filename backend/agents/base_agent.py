"""Base agent class for the multi-agent system."""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from datetime import datetime
import logging
import asyncio
from pydantic import BaseModel

logger = logging.getLogger(__name__)


class AgentInput(BaseModel):
    """Standard input format for agents."""
    user_id: str
    data: Dict[str, Any]
    context: Optional[Dict[str, Any]] = {}
    session_id: Optional[str] = None


class AgentOutput(BaseModel):
    """Standard output format for agents."""
    agent_name: str
    success: bool
    result: Dict[str, Any]
    confidence_score: float
    processing_time: float
    error_message: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = {}


class BaseAgent(ABC):
    """Abstract base class for all agents in the system."""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.logger = logging.getLogger(f"agents.{name}")
        self._initialize()
    
    def _initialize(self):
        """Initialize agent-specific resources."""
        self.logger.info(f"Initializing agent: {self.name}")
    
    async def execute(self, input_data: AgentInput) -> AgentOutput:
        """Execute the agent with error handling and timing."""
        start_time = datetime.now()
        
        try:
            self.logger.info(f"Agent {self.name} starting execution for user {input_data.user_id}")
            
            # Validate input
            self._validate_input(input_data)
            
            # Execute agent logic
            result = await self._process(input_data)
            
            # Calculate processing time
            processing_time = (datetime.now() - start_time).total_seconds()
            
            # Create output
            output = AgentOutput(
                agent_name=self.name,
                success=True,
                result=result,
                confidence_score=self._calculate_confidence(result),
                processing_time=processing_time,
                metadata={"timestamp": datetime.now().isoformat()}
            )
            
            self.logger.info(f"Agent {self.name} completed execution in {processing_time:.2f}s")
            return output
            
        except Exception as e:
            processing_time = (datetime.now() - start_time).total_seconds()
            error_msg = f"Agent {self.name} failed: {str(e)}"
            self.logger.error(error_msg)
            
            return AgentOutput(
                agent_name=self.name,
                success=False,
                result={},
                confidence_score=0.0,
                processing_time=processing_time,
                error_message=error_msg
            )
    
    @abstractmethod
    async def _process(self, input_data: AgentInput) -> Dict[str, Any]:
        """Core agent processing logic. Must be implemented by subclasses."""
        pass
    
    def _validate_input(self, input_data: AgentInput):
        """Validate agent input. Override for custom validation."""
        if not input_data.user_id:
            raise ValueError("user_id is required")
    
    def _calculate_confidence(self, result: Dict[str, Any]) -> float:
        """Calculate confidence score for the result. Override for custom logic."""
        return 0.8  # Default confidence
    
    async def health_check(self) -> bool:
        """Check if the agent is healthy and operational."""
        try:
            # Basic health check - can be overridden for specific checks
            return True
        except Exception as e:
            self.logger.error(f"Health check failed for {self.name}: {e}")
            return False


class AgentOrchestrator:
    """Orchestrator for managing multiple agents and their interactions."""
    
    def __init__(self):
        self.agents: Dict[str, BaseAgent] = {}
        self.logger = logging.getLogger("agents.orchestrator")
    
    def register_agent(self, agent: BaseAgent):
        """Register an agent with the orchestrator."""
        self.agents[agent.name] = agent
        self.logger.info(f"Registered agent: {agent.name}")
    
    async def execute_sequential(self, agent_names: List[str], input_data: AgentInput) -> List[AgentOutput]:
        """Execute agents sequentially, passing output to next agent."""
        results = []
        current_input = input_data
        
        for agent_name in agent_names:
            if agent_name not in self.agents:
                raise ValueError(f"Agent {agent_name} not found")
            
            agent = self.agents[agent_name]
            output = await agent.execute(current_input)
            results.append(output)
            
            # Update input for next agent with previous output
            if output.success:
                current_input.context.update(output.result)
        
        return results
    
    async def execute_parallel(self, agent_names: List[str], input_data: AgentInput) -> List[AgentOutput]:
        """Execute agents in parallel."""
        tasks = []
        
        for agent_name in agent_names:
            if agent_name not in self.agents:
                raise ValueError(f"Agent {agent_name} not found")
            
            agent = self.agents[agent_name]
            tasks.append(agent.execute(input_data))
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Convert exceptions to failed AgentOutput
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                processed_results.append(AgentOutput(
                    agent_name=agent_names[i],
                    success=False,
                    result={},
                    confidence_score=0.0,
                    processing_time=0.0,
                    error_message=str(result)
                ))
            else:
                processed_results.append(result)
        
        return processed_results
    
    async def health_check_all(self) -> Dict[str, bool]:
        """Check health of all registered agents."""
        health_status = {}
        
        for agent_name, agent in self.agents.items():
            health_status[agent_name] = await agent.health_check()
        
        return health_status


# Global orchestrator instance
orchestrator = AgentOrchestrator()