namespace RealEstate.Domain.Entities;

public class Area
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int CityId { get; set; }

    public City City { get; set; } = null!;
    public ICollection<Property> Properties { get; set; } = new List<Property>();
}
