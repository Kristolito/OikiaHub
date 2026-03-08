using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;

namespace RealEstate.Infrastructure.Persistence;

public class DevelopmentDataSeeder
{
    private readonly RealEstateDbContext _dbContext;
    private readonly IPasswordHasher<User> _passwordHasher;

    public DevelopmentDataSeeder(RealEstateDbContext dbContext, IPasswordHasher<User> passwordHasher)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        await _dbContext.Database.MigrateAsync(cancellationToken);

        var publishedCount = await _dbContext.Properties.CountAsync(x => x.Status == PropertyStatus.Published, cancellationToken);
        if (publishedCount >= 10)
        {
            return;
        }

        var agentRoleId = await _dbContext.Roles
            .Where(x => x.Name == "Agent")
            .Select(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        var userRoleId = await _dbContext.Roles
            .Where(x => x.Name == "User")
            .Select(x => x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (agentRoleId == 0 || userRoleId == 0)
        {
            return;
        }

        var agentUsers = new List<User>
        {
            await GetOrCreateUserAsync("Demo", "AgentOne", "agent1@oikiahub.local", agentRoleId, cancellationToken),
            await GetOrCreateUserAsync("Demo", "AgentTwo", "agent2@oikiahub.local", agentRoleId, cancellationToken),
            await GetOrCreateUserAsync("Demo", "User", "user@oikiahub.local", userRoleId, cancellationToken),
        };

        await _dbContext.SaveChangesAsync(cancellationToken);

        var agentProfiles = new List<AgentProfile>
        {
            await GetOrCreateAgentProfileAsync(agentUsers[0].Id, "+30 210 000 0001", "BlueSky Realty", "Specialist in premium family homes.", cancellationToken),
            await GetOrCreateAgentProfileAsync(agentUsers[1].Id, "+30 210 000 0002", "UrbanNest Properties", "Focused on modern city apartments and rentals.", cancellationToken),
        };

        await _dbContext.SaveChangesAsync(cancellationToken);

        var areas = await _dbContext.Areas
            .AsNoTracking()
            .OrderBy(x => x.Id)
            .Take(5)
            .ToListAsync(cancellationToken);

        var amenities = await _dbContext.Amenities
            .AsNoTracking()
            .OrderBy(x => x.Id)
            .Take(5)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        if (areas.Count == 0)
        {
            return;
        }

        var imageSets = new[]
        {
            new[]
            {
                "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1400&q=80",
                "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1400&q=80",
                "https://images.unsplash.com/photo-1600585154208-7a1c1f6f0c6e?auto=format&fit=crop&w=1400&q=80",
            },
            new[]
            {
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=80",
                "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1400&q=80",
                "https://images.unsplash.com/photo-1605146769289-440113cc3d00?auto=format&fit=crop&w=1400&q=80",
            },
            new[]
            {
                "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1400&q=80",
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80",
                "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1400&q=80",
            },
        };

        var samples = new (string Title, string Description, decimal Price, PropertyType Type, ListingType Listing, int Beds, int Baths, decimal Sqm, decimal Lat, decimal Lng, int? YearBuilt, int? Floor, int AreaIndex, int AgentIndex)[]
        {
            ("Modern Family Villa", "Bright detached house with private garden and open-plan living spaces.", 420000m, PropertyType.House, ListingType.Sale, 5, 3, 240m, 38.073321m, 23.808341m, 2017, null, 0, 0),
            ("Luxury Waterfront House", "Sea-view residence with premium finishes and expansive terraces.", 680000m, PropertyType.House, ListingType.Sale, 4, 3, 210m, 37.806191m, 23.776912m, 2019, null, 1, 0),
            ("City Apartment Penthouse", "Contemporary penthouse close to city center amenities.", 290000m, PropertyType.Apartment, ListingType.Sale, 3, 2, 140m, 37.978554m, 23.743217m, 2014, 5, 1, 1),
            ("Cozy Studio Near Metro", "Compact and efficient studio ideal for young professionals.", 780m, PropertyType.Studio, ListingType.Rent, 1, 1, 38m, 40.617923m, 22.958173m, 2012, 2, 2, 1),
            ("Suburban Maisonette", "Two-level maisonette with balcony and storage room.", 215000m, PropertyType.Maisonette, ListingType.Sale, 3, 2, 128m, 40.594923m, 22.949591m, 2010, 1, 3, 0),
            ("Executive Commercial Space", "High-visibility commercial unit for retail or office use.", 1800m, PropertyType.Commercial, ListingType.Rent, 0, 1, 95m, 38.248066m, 21.735344m, 2008, 0, 4, 1),
            ("Garden View Apartment", "Quiet apartment with park-facing balcony and modern kitchen.", 198000m, PropertyType.Apartment, ListingType.Sale, 2, 1, 88m, 38.065014m, 23.805320m, 2016, 3, 0, 1),
            ("Downtown Rental Flat", "Well-connected rental flat with elevator access.", 1050m, PropertyType.Apartment, ListingType.Rent, 2, 1, 72m, 37.981915m, 23.737612m, 2011, 4, 1, 1),
            ("Family Home With Yard", "Spacious home with private yard in a calm neighborhood.", 355000m, PropertyType.House, ListingType.Sale, 4, 2, 180m, 40.612773m, 22.963534m, 2015, null, 2, 0),
            ("Contemporary Loft", "Open-space loft designed for modern urban living.", 240000m, PropertyType.Apartment, ListingType.Sale, 2, 2, 110m, 38.251441m, 21.742721m, 2020, 2, 4, 1),
        };

        var existingTitles = await _dbContext.Properties
            .AsNoTracking()
            .Select(x => x.Title)
            .ToListAsync(cancellationToken);

        foreach (var sample in samples)
        {
            if (existingTitles.Contains(sample.Title, StringComparer.OrdinalIgnoreCase))
            {
                continue;
            }

            var area = areas[Math.Min(sample.AreaIndex, areas.Count - 1)];
            var profile = agentProfiles[Math.Min(sample.AgentIndex, agentProfiles.Count - 1)];
            var imageSet = imageSets[sample.AgentIndex % imageSets.Length];

            var property = new Property
            {
                Title = sample.Title,
                Description = sample.Description,
                Price = sample.Price,
                PropertyType = sample.Type,
                ListingType = sample.Listing,
                Bedrooms = sample.Beds,
                Bathrooms = sample.Baths,
                SquareMeters = sample.Sqm,
                Address = $"{sample.AreaIndex + 10} Example Street",
                PostalCode = $"10{sample.AreaIndex}00",
                CityId = area.CityId,
                AreaId = area.Id,
                Latitude = sample.Lat,
                Longitude = sample.Lng,
                YearBuilt = sample.YearBuilt,
                Floor = sample.Floor,
                Status = PropertyStatus.Published,
                AgentProfileId = profile.Id,
            };

            for (var i = 0; i < imageSet.Length; i++)
            {
                property.PropertyImages.Add(new PropertyImage
                {
                    ImageUrl = imageSet[i],
                    IsPrimary = i == 0,
                    SortOrder = i
                });
            }

            foreach (var amenityId in amenities.Take(3 + (sample.AreaIndex % 2)))
            {
                property.PropertyAmenities.Add(new PropertyAmenity
                {
                    AmenityId = amenityId
                });
            }

            _dbContext.Properties.Add(property);
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private async Task<User> GetOrCreateUserAsync(
        string firstName,
        string lastName,
        string email,
        int roleId,
        CancellationToken cancellationToken)
    {
        var existing = await _dbContext.Users.FirstOrDefaultAsync(x => x.Email == email, cancellationToken);
        if (existing is not null)
        {
            return existing;
        }

        var user = new User
        {
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            RoleId = roleId,
            PasswordHash = string.Empty,
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, "Demo123!");
        _dbContext.Users.Add(user);
        return user;
    }

    private async Task<AgentProfile> GetOrCreateAgentProfileAsync(
        int userId,
        string phone,
        string agencyName,
        string bio,
        CancellationToken cancellationToken)
    {
        var existing = await _dbContext.AgentProfiles.FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
        if (existing is not null)
        {
            return existing;
        }

        var profile = new AgentProfile
        {
            UserId = userId,
            PhoneNumber = phone,
            AgencyName = agencyName,
            Bio = bio,
        };

        _dbContext.AgentProfiles.Add(profile);
        return profile;
    }
}
