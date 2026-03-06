namespace RealEstate.Application.DTOs.Auth;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public CurrentUserResponse User { get; set; } = new();
}
