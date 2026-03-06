using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.DTOs.Auth;
using RealEstate.Application.Exceptions;
using RealEstate.Application.Interfaces;

namespace RealEstate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var response = await _authService.RegisterAsync(request, cancellationToken);
            return Ok(response);
        }
        catch (ValidationException ex)
        {
            return BadRequest(new ValidationProblemDetails(ToValidationProblem(ex)));
        }
        catch (ConflictException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var response = await _authService.LoginAsync(request, cancellationToken);
            return Ok(response);
        }
        catch (ValidationException ex)
        {
            return BadRequest(new ValidationProblemDetails(ToValidationProblem(ex)));
        }
        catch (AuthenticationException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<CurrentUserResponse>> Me(CancellationToken cancellationToken)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized(new { message = "Invalid authentication token." });
        }

        var user = await _authService.GetCurrentUserAsync(userId, cancellationToken);
        if (user is null)
        {
            return Unauthorized(new { message = "User not found." });
        }

        return Ok(user);
    }

    private static IDictionary<string, string[]> ToValidationProblem(ValidationException exception)
    {
        return exception.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(g => g.Key, g => g.Select(x => x.ErrorMessage).ToArray());
    }
}
