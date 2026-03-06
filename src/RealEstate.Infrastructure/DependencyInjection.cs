using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RealEstate.Application.Interfaces;
using RealEstate.Application.DTOs.Properties;
using RealEstate.Domain.Entities;
using RealEstate.Infrastructure.Auth;
using RealEstate.Infrastructure.Persistence;
using RealEstate.Infrastructure.Services;
using FluentValidation;
using RealEstate.Application.Validators.Properties;
using RealEstate.Application.Validators.Favorites;
using RealEstate.Application.DTOs.Favorites;
using RealEstate.Application.DTOs.Inquiries;
using RealEstate.Application.Validators.Inquiries;
using RealEstate.Application.DTOs.PropertyImages;
using RealEstate.Application.Validators.PropertyImages;

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
        services.AddScoped<IPropertyService, PropertyService>();
        services.AddScoped<ILookupService, LookupService>();
        services.AddScoped<IFavoriteService, FavoriteService>();
        services.AddScoped<IInquiryService, InquiryService>();
        services.AddScoped<IFileStorageService, LocalFileStorageService>();
        services.AddScoped<IPropertyImageService, PropertyImageService>();
        services.AddScoped<IValidator<CreatePropertyRequest>, CreatePropertyRequestValidator>();
        services.AddScoped<IValidator<UpdatePropertyRequest>, UpdatePropertyRequestValidator>();
        services.AddScoped<IValidator<GetPropertiesRequest>, GetPropertiesRequestValidator>();
        services.AddScoped<IValidator<AddFavoriteRequest>, AddFavoriteRequestValidator>();
        services.AddScoped<IValidator<CreateInquiryRequest>, CreateInquiryRequestValidator>();
        services.AddScoped<IValidator<UpdateInquiryStatusRequest>, UpdateInquiryStatusRequestValidator>();
        services.AddScoped<IValidator<ReorderPropertyImagesRequest>, ReorderPropertyImagesRequestValidator>();

        return services;
    }
}
