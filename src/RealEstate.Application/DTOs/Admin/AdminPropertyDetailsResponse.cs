using RealEstate.Domain.Enums;

namespace RealEstate.Application.DTOs.Admin;

public class AdminPropertyDetailsResponse
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
    public string City { get; set; } = string.Empty;
    public int AreaId { get; set; }
    public string Area { get; set; } = string.Empty;
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public int? YearBuilt { get; set; }
    public int? Floor { get; set; }
    public PropertyStatus Status { get; set; }
    public int AgentProfileId { get; set; }
    public AdminPropertyAgentResponse Agent { get; set; } = new();
    public List<AdminPropertyImageResponse> Images { get; set; } = new();
    public List<AdminPropertyAmenityResponse> Amenities { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class AdminPropertyAgentResponse
{
    public int AgentProfileId { get; set; }
    public int UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string AgencyName { get; set; } = string.Empty;
}

public class AdminPropertyImageResponse
{
    public int Id { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public bool IsPrimary { get; set; }
    public int SortOrder { get; set; }
}

public class AdminPropertyAmenityResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
