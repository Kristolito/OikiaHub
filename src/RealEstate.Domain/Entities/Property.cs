using RealEstate.Domain.Enums;

namespace RealEstate.Domain.Entities;

public class Property
{
    public int Id { get; set; }
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
    public int AgentProfileId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public City City { get; set; } = null!;
    public Area Area { get; set; } = null!;
    public AgentProfile AgentProfile { get; set; } = null!;
    public ICollection<PropertyImage> PropertyImages { get; set; } = new List<PropertyImage>();
    public ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();
    public ICollection<Inquiry> Inquiries { get; set; } = new List<Inquiry>();
    public ICollection<PropertyAmenity> PropertyAmenities { get; set; } = new List<PropertyAmenity>();
}
