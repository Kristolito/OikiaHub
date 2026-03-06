using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.DTOs.Admin;
using RealEstate.Application.Exceptions;
using RealEstate.Application.Interfaces;

namespace RealEstate.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<AdminDashboardResponse>> GetDashboard(CancellationToken cancellationToken)
    {
        return Ok(await _adminService.GetDashboardAsync(cancellationToken));
    }

    [HttpGet("users")]
    public async Task<ActionResult<IReadOnlyList<AdminUserListItemResponse>>> GetUsers(CancellationToken cancellationToken)
    {
        return Ok(await _adminService.GetUsersAsync(cancellationToken));
    }

    [HttpGet("users/{id:int}")]
    public async Task<ActionResult<AdminUserDetailsResponse>> GetUserById(int id, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _adminService.GetUserByIdAsync(id, cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("properties")]
    public async Task<ActionResult<IReadOnlyList<AdminPropertyListItemResponse>>> GetProperties(CancellationToken cancellationToken)
    {
        return Ok(await _adminService.GetPropertiesAsync(cancellationToken));
    }

    [HttpGet("properties/{id:int}")]
    public async Task<ActionResult<AdminPropertyDetailsResponse>> GetPropertyById(int id, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _adminService.GetPropertyByIdAsync(id, cancellationToken));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPatch("properties/{id:int}/status")]
    public async Task<ActionResult<AdminPropertyDetailsResponse>> UpdatePropertyStatus(
        int id,
        UpdatePropertyStatusRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _adminService.UpdatePropertyStatusAsync(id, request, cancellationToken));
        }
        catch (ValidationException ex)
        {
            return BadRequest(new ValidationProblemDetails(ToValidationProblem(ex)));
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("properties/{id:int}")]
    public async Task<IActionResult> DeleteProperty(int id, CancellationToken cancellationToken)
    {
        try
        {
            await _adminService.DeletePropertyAsync(id, cancellationToken);
            return NoContent();
        }
        catch (NotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    private static IDictionary<string, string[]> ToValidationProblem(ValidationException exception)
    {
        return exception.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(g => g.Key, g => g.Select(x => x.ErrorMessage).ToArray());
    }
}
