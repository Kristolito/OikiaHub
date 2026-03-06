using RealEstate.Domain.Enums;

namespace RealEstate.Application.DTOs.Properties;

public class UpdatePropertyRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public PropertyType PropertyType { get; set; }
    public ListingType ListingType { get; set; }
    public int Bedrooms { get; set; }
    public int Bathrooms { get; set; }
    public decimal SquareMeters { get; set; }
    public string Address { get; set; } = string.Empty;
    public string? PostalCode { get; set; }
    public int CityId { get; set; }
    public int AreaId { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public int? YearBuilt { get; set; }
    public int? Floor { get; set; }
    public PropertyStatus Status { get; set; }
    public List<int> AmenityIds { get; set; } = new();
    public List<string> ImageUrls { get; set; } = new();
    public string? PrimaryImageUrl { get; set; }
    public int? AgentProfileId { get; set; }
}
