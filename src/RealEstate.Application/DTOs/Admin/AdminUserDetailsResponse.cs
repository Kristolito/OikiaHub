namespace RealEstate.Application.DTOs.Admin;

public class AdminUserDetailsResponse
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public AdminAgentProfileResponse? AgentProfile { get; set; }
    public int PropertyCount { get; set; }
    public int InquiryCount { get; set; }
}

public class AdminAgentProfileResponse
{
    public int Id { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string AgencyName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? ProfileImageUrl { get; set; }
}
