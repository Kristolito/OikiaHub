using RealEstate.Domain.Enums;

namespace RealEstate.Application.DTOs.Inquiries;

public class InquiryDetailsResponse
{
    public int Id { get; set; }
    public int PropertyId { get; set; }
    public string PropertyTitle { get; set; } = string.Empty;
    public string PropertyCity { get; set; } = string.Empty;
    public string PropertyArea { get; set; } = string.Empty;
    public decimal PropertyPrice { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public InquiryStatus Status { get; set; }
    public InquiryUserSummary User { get; set; } = new();
    public InquiryAgentSummary Agent { get; set; } = new();
}

public class InquiryUserSummary
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
}

public class InquiryAgentSummary
{
    public int AgentProfileId { get; set; }
    public int UserId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
}
