using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace RealEstate.Infrastructure.Persistence;

public class RealEstateDbContextFactory : IDesignTimeDbContextFactory<RealEstateDbContext>
{
    public RealEstateDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<RealEstateDbContext>();
        var connectionString = "Server=127.0.0.1;Port=3306;Database=realestate;User=root;Password=WyXNn84bTKx6;";
        var serverVersion = new MySqlServerVersion(new Version(8, 0, 36));

        optionsBuilder.UseMySql(connectionString, serverVersion);

        return new RealEstateDbContext(optionsBuilder.Options);
    }
}
