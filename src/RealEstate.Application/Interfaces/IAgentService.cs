using RealEstate.Application.DTOs.Agents;

namespace RealEstate.Application.Interfaces;

public interface IAgentService
{
    Task<AgentProfileResponse?> GetAgentProfileAsync(int agentProfileId, CancellationToken cancellationToken = default);
}
