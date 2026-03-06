using System.Security.Claims;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.DTOs.PropertyImages;
using RealEstate.Application.Exceptions;
using RealEstate.Application.Interfaces;

namespace RealEstate.Api.Controllers;

[ApiController]
[Route("api/properties/{propertyId:int}/images")]
public class PropertyImagesController : ControllerBase
{
    private readonly IPropertyImageService _propertyImageService;

    public PropertyImagesController(IPropertyImageService propertyImageService)
    {
        _propertyImageService = propertyImageService;
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Agent")]
    public async Task<ActionResult<IReadOnlyList<PropertyImageItemResponse>>> Upload(
        int propertyId,
        [FromForm] UploadPropertyImagesForm form,
        CancellationToken cancellationToken)
    {
        try
        {
            var files = new List<FileUploadData>();
            foreach (var file in form.Files)
            {
                if (file.Length <= 0)
                {
                    continue;
                }

                await using var stream = file.OpenReadStream();
                using var memory = new MemoryStream();
                await stream.CopyToAsync(memory, cancellationToken);
                files.Add(new FileUploadData
                {
                    FileName = file.FileName,
                    ContentType = file.ContentType ?? string.Empty,
                    Length = file.Length,
                    Content = memory.ToArray()
                });
            }

            var (userId, role) = GetActorRequired();
            var response = await _propertyImageService.UploadAsync(propertyId, files, userId, role, cancellationToken);
            return Ok(response);
        }
        catch (ValidationException ex)
        {
            return BadRequest(new ValidationProblemDetails(ToValidationProblem(ex)));
        }
        catch (BadRequestException ex)
        {
            return BadRequest(new { message = ex.Message });
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

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<PropertyImageItemResponse>>> Get(int propertyId, CancellationToken cancellationToken)
    {
        try
        {
            var (userId, role) = GetActorOptional();
            var response = await _propertyImageService.GetByPropertyAsync(propertyId, userId, role, cancellationToken);
            return Ok(response);
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

    [HttpDelete("{imageId:int}")]
    [Authorize(Roles = "Admin,Agent")]
    public async Task<IActionResult> Delete(int propertyId, int imageId, CancellationToken cancellationToken)
    {
        try
        {
            var (userId, role) = GetActorRequired();
            await _propertyImageService.DeleteAsync(propertyId, imageId, userId, role, cancellationToken);
            return NoContent();
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

    [HttpPatch("{imageId:int}/primary")]
    [Authorize(Roles = "Admin,Agent")]
    public async Task<ActionResult<IReadOnlyList<PropertyImageItemResponse>>> SetPrimary(int propertyId, int imageId, CancellationToken cancellationToken)
    {
        try
        {
            var (userId, role) = GetActorRequired();
            var response = await _propertyImageService.SetPrimaryAsync(propertyId, imageId, userId, role, cancellationToken);
            return Ok(response);
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

    [HttpPatch("reorder")]
    [Authorize(Roles = "Admin,Agent")]
    public async Task<ActionResult<IReadOnlyList<PropertyImageItemResponse>>> Reorder(
        int propertyId,
        ReorderPropertyImagesRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var (userId, role) = GetActorRequired();
            var response = await _propertyImageService.ReorderAsync(propertyId, request, userId, role, cancellationToken);
            return Ok(response);
        }
        catch (ValidationException ex)
        {
            return BadRequest(new ValidationProblemDetails(ToValidationProblem(ex)));
        }
        catch (BadRequestException ex)
        {
            return BadRequest(new { message = ex.Message });
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

    private (int UserId, string Role) GetActorRequired()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var role = User.FindFirstValue(ClaimTypes.Role);

        if (!int.TryParse(userIdClaim, out var userId) || string.IsNullOrWhiteSpace(role))
        {
            throw new ForbiddenException("Invalid authentication token.");
        }

        return (userId, role);
    }

    private (int? UserId, string? Role) GetActorOptional()
    {
        if (!(User.Identity?.IsAuthenticated ?? false))
        {
            return (null, null);
        }

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var role = User.FindFirstValue(ClaimTypes.Role);
        if (int.TryParse(userIdClaim, out var userId))
        {
            return (userId, role);
        }

        return (null, role);
    }

    private static IDictionary<string, string[]> ToValidationProblem(ValidationException exception)
    {
        return exception.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(g => g.Key, g => g.Select(x => x.ErrorMessage).ToArray());
    }

    public class UploadPropertyImagesForm
    {
        public List<IFormFile> Files { get; set; } = new();
    }
}
