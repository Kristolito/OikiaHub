namespace RealEstate.Domain.Entities;

public class AgentProfile
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string AgencyName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? ProfileImageUrl { get; set; }

    public User User { get; set; } = null!;
    public ICollection<Property> Properties { get; set; } = new List<Property>();
}
