using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Application.DTOs.Lookups;
using RealEstate.Application.Interfaces;

namespace RealEstate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous]
public class LookupsController : ControllerBase
{
    private readonly ILookupService _lookupService;

    public LookupsController(ILookupService lookupService)
    {
        _lookupService = lookupService;
    }

    [HttpGet("cities")]
    public async Task<ActionResult<IReadOnlyList<LookupItemResponse>>> Cities(CancellationToken cancellationToken)
    {
        return Ok(await _lookupService.GetCitiesAsync(cancellationToken));
    }

    [HttpGet("areas")]
    public async Task<ActionResult<IReadOnlyList<LookupItemResponse>>> Areas([FromQuery] int? cityId, CancellationToken cancellationToken)
    {
        return Ok(await _lookupService.GetAreasAsync(cityId, cancellationToken));
    }

    [HttpGet("amenities")]
    public async Task<ActionResult<IReadOnlyList<LookupItemResponse>>> Amenities(CancellationToken cancellationToken)
    {
        return Ok(await _lookupService.GetAmenitiesAsync(cancellationToken));
    }
}
