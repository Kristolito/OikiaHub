namespace RealEstate.Application.DTOs.Admin;

public class AdminDashboardResponse
{
    public int TotalUsers { get; set; }
    public int TotalAgents { get; set; }
    public int TotalProperties { get; set; }
    public int TotalPublishedProperties { get; set; }
    public int TotalDraftProperties { get; set; }
    public int TotalSoldProperties { get; set; }
    public int TotalInquiries { get; set; }
    public int RecentUsersCount { get; set; }
    public int RecentPropertiesCount { get; set; }
}
