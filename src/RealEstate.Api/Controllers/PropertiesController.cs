using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.DTOs.Common;
using RealEstate.Application.DTOs.Properties;
using RealEstate.Application.Exceptions;
using RealEstate.Application.Interfaces;

namespace RealEstate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PropertiesController : ControllerBase
{
    private readonly IPropertyService _propertyService;

    public PropertiesController(IPropertyService propertyService)
    {
        _propertyService = propertyService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResponse<PropertyListItemResponse>>> GetAll([FromQuery] GetPropertiesRequest request, CancellationToken cancellationToken)
    {
        var response = await _propertyService.GetPropertiesAsync(request, cancellationToken);
        return Ok(response);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<PropertyDetailsResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var property = await _propertyService.GetPropertyByIdAsync(id, cancellationToken);
        if (property is null)
        {
            return NotFound(new { message = "Property not found." });
        }

        return Ok(property);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Agent")]
    public async Task<ActionResult<PropertyDetailsResponse>> Create(CreatePropertyRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var (userId, role) = GetActor();
            var created = await _propertyService.CreatePropertyAsync(request, userId, role, cancellationToken);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }
        catch (ValidationException ex)
        {
            return BadRequest(new ValidationProblemDetails(ToValidationProblem(ex)));
        }
        catch (BadRequestException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ForbiddenException ex)
        {
            return ForbidWithMessage(ex.Message);
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Agent")]
    public async Task<ActionResult<PropertyDetailsResponse>> Update(int id, UpdatePropertyRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var (userId, role) = GetActor();
            var updated = await _propertyService.UpdatePropertyAsync(id, request, userId, role, cancellationToken);
            return Ok(updated);
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
        catch (ForbiddenException ex)
        {
            return ForbidWithMessage(ex.Message);
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin,Agent")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        try
        {
            var (userId, role) = GetActor();
            await _propertyService.DeletePropertyAsync(id, userId, role, cancellationToken);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (ForbiddenException ex)
        {
            return ForbidWithMessage(ex.Message);
        }
    }

    private (int UserId, string Role) GetActor()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var roleClaim = User.FindFirstValue(ClaimTypes.Role);

        if (!int.TryParse(userIdClaim, out var userId) || string.IsNullOrWhiteSpace(roleClaim))
        {
            throw new ForbiddenException("Invalid authentication token.");
        }

        return (userId, roleClaim);
    }

    private ObjectResult ForbidWithMessage(string message)
    {
        return StatusCode(StatusCodes.Status403Forbidden, new { message });
    }

    private static IDictionary<string, string[]> ToValidationProblem(ValidationException exception)
    {
        return exception.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(g => g.Key, g => g.Select(x => x.ErrorMessage).ToArray());
    }
}
