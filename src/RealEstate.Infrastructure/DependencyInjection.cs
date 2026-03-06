using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RealEstate.Infrastructure.Persistence;

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

        return services;
    }
}
