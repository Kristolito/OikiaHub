using RealEstate.Application.DTOs.Auth;
using RealEstate.Domain.Entities;

namespace RealEstate.Application.Interfaces;

public interface IJwtTokenGenerator
{
    JwtTokenResult Generate(User user, string roleName);
}
