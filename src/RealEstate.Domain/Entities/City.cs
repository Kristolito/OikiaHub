namespace RealEstate.Domain.Entities;

public class City
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<Area> Areas { get; set; } = new List<Area>();
    public ICollection<Property> Properties { get; set; } = new List<Property>();
}
