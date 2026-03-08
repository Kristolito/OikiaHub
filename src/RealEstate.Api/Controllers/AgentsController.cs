using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.DTOs.Agents;
using RealEstate.Application.Interfaces;

namespace RealEstate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AgentsController : ControllerBase
{
    private readonly IAgentService _agentService;

    public AgentsController(IAgentService agentService)
    {
        _agentService = agentService;
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<AgentProfileResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var agent = await _agentService.GetAgentProfileAsync(id, cancellationToken);
        if (agent is null)
        {
            return NotFound(new { message = "Agent not found." });
        }

        return Ok(agent);
    }
}
