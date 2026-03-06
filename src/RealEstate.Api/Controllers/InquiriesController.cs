using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.DTOs.Inquiries;
using RealEstate.Application.Exceptions;
using RealEstate.Application.Interfaces;

namespace RealEstate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class InquiriesController : ControllerBase
{
    private readonly IInquiryService _inquiryService;

    public InquiriesController(IInquiryService inquiryService)
    {
        _inquiryService = inquiryService;
    }

    [HttpPost]
    public async Task<ActionResult<InquiryDetailsResponse>> Create(CreateInquiryRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var response = await _inquiryService.CreateAsync(userId, request, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = response.Id }, response);
        }
        catch (ValidationException ex)
        {
            return BadRequest(new ValidationProblemDetails(ToValidationProblem(ex)));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (BadRequestException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("my")]
    public async Task<ActionResult<IReadOnlyList<InquiryListItemResponse>>> My(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var response = await _inquiryService.GetMyAsync(userId, cancellationToken);
        return Ok(response);
    }

    [HttpGet("agent")]
    [Authorize(Roles = "Agent")]
    public async Task<ActionResult<IReadOnlyList<InquiryListItemResponse>>> Agent(CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var response = await _inquiryService.GetAgentAsync(userId, cancellationToken);
            return Ok(response);
        }
        catch (ForbiddenException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
    }

    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<IReadOnlyList<InquiryListItemResponse>>> Admin(CancellationToken cancellationToken)
    {
        return Ok(await _inquiryService.GetAllAsync(cancellationToken));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<InquiryDetailsResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        try
        {
            var (userId, role) = GetActor();
            var response = await _inquiryService.GetByIdAsync(id, userId, role, cancellationToken);
            if (response is null)
            {
                return NotFound(new { message = "Inquiry not found." });
            }

            return Ok(response);
        }
        catch (ForbiddenException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
    }

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "Admin,Agent")]
    public async Task<ActionResult<InquiryDetailsResponse>> UpdateStatus(int id, UpdateInquiryStatusRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var (userId, role) = GetActor();
            var response = await _inquiryService.UpdateStatusAsync(id, request, userId, role, cancellationToken);
            return Ok(response);
        }
        catch (ValidationException ex)
        {
            return BadRequest(new ValidationProblemDetails(ToValidationProblem(ex)));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ForbiddenException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim, out var userId))
        {
            throw new BadRequestException("Invalid authentication token.");
        }

        return userId;
    }

    private (int UserId, string Role) GetActor()
    {
        var role = User.FindFirstValue(ClaimTypes.Role);
        var userId = GetUserId();
        return (userId, role ?? "User");
    }

    private static IDictionary<string, string[]> ToValidationProblem(ValidationException exception)
    {
        return exception.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(g => g.Key, g => g.Select(x => x.ErrorMessage).ToArray());
    }
}
