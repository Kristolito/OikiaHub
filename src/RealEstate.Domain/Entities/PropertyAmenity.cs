namespace RealEstate.Domain.Entities;

public class PropertyAmenity
{
    public int PropertyId { get; set; }
    public int AmenityId { get; set; }

    public Property Property { get; set; } = null!;
    public Amenity Amenity { get; set; } = null!;
}
