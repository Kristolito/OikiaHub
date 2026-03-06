using RealEstate.Domain.Enums;

namespace RealEstate.Application.DTOs.Properties;

public class GetPropertiesRequest
{
    public string? SearchTerm { get; set; }
    public int? CityId { get; set; }
    public int? AreaId { get; set; }
    public ListingType? ListingType { get; set; }
    public PropertyType? PropertyType { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public int? MinBedrooms { get; set; }
    public int? MaxBedrooms { get; set; }
    public int? MinBathrooms { get; set; }
    public int? MaxBathrooms { get; set; }
    public decimal? MinSquareMeters { get; set; }
    public decimal? MaxSquareMeters { get; set; }
    public PropertyStatus? Status { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string SortBy { get; set; } = "newest";
}
