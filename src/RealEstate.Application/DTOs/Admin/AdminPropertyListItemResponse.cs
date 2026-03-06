using RealEstate.Domain.Enums;

namespace RealEstate.Application.DTOs.Admin;

public class AdminPropertyListItemResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string AgentName { get; set; } = string.Empty;
    public string AgentEmail { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Area { get; set; } = string.Empty;
    public PropertyStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
