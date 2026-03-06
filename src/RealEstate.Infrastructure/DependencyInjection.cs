using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RealEstate.Application.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Infrastructure.Auth;
using RealEstate.Infrastructure.Persistence;
using RealEstate.Infrastructure.Services;

namespace RealEstate.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Server=localhost;Database=realestate;User=root;Password=yourpassword;";
        var serverVersion = new MySqlServerVersion(new Version(8, 0, 36));

        services.AddDbContext<RealEstateDbContext>(options =>
            options.UseMySql(connectionString, serverVersion));
        services.Configure<JwtOptions>(configuration.GetSection("Jwt"));

        services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}
