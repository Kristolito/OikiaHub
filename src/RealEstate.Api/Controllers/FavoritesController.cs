using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.DTOs.Favorites;
using RealEstate.Application.Exceptions;
using RealEstate.Application.Interfaces;

namespace RealEstate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FavoritesController : ControllerBase
{
    private readonly IFavoriteService _favoriteService;

    public FavoritesController(IFavoriteService favoriteService)
    {
        _favoriteService = favoriteService;
    }

    [HttpPost]
    public async Task<ActionResult<FavoriteStatusResponse>> Add(AddFavoriteRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var response = await _favoriteService.AddAsync(userId, request, cancellationToken);
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
        catch (BadRequestException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{propertyId:int}")]
    public async Task<IActionResult> Remove(int propertyId, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            await _favoriteService.RemoveAsync(userId, propertyId, cancellationToken);
            return NoContent();
        }
        catch (BadRequestException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<FavoriteItemResponse>>> GetMine(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var response = await _favoriteService.GetMineAsync(userId, cancellationToken);
        return Ok(response);
    }

    [HttpGet("check/{propertyId:int}")]
    public async Task<ActionResult<FavoriteStatusResponse>> Check(int propertyId, CancellationToken cancellationToken)
    {
        try
        {
            var userId = GetUserId();
            var response = await _favoriteService.CheckAsync(userId, propertyId, cancellationToken);
            return Ok(response);
        }
        catch (BadRequestException ex)
        {
            return BadRequest(new { message = ex.Message });
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

    private static IDictionary<string, string[]> ToValidationProblem(ValidationException exception)
    {
        return exception.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(g => g.Key, g => g.Select(x => x.ErrorMessage).ToArray());
    }
}
