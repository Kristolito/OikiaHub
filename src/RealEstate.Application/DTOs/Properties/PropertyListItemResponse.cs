using RealEstate.Domain.Enums;

namespace RealEstate.Application.DTOs.Properties;

public class PropertyListItemResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string City { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;
    public int Bedrooms { get; set; }
    public int Bathrooms { get; set; }
    public decimal SquareMeters { get; set; }
    public ListingType ListingType { get; set; }
    public PropertyType PropertyType { get; set; }
    public PropertyStatus Status { get; set; }
    public string? PrimaryImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}
