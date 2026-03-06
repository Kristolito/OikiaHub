using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.DTOs.Auth;
using RealEstate.Application.Exceptions;
using RealEstate.Application.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Infrastructure.Persistence;

namespace RealEstate.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly RealEstateDbContext _dbContext;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IValidator<RegisterRequest> _registerValidator;
    private readonly IValidator<LoginRequest> _loginValidator;

    public AuthService(
        RealEstateDbContext dbContext,
        IPasswordHasher<User> passwordHasher,
        IJwtTokenGenerator jwtTokenGenerator,
        IValidator<RegisterRequest> registerValidator,
        IValidator<LoginRequest> loginValidator)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _jwtTokenGenerator = jwtTokenGenerator;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        await _registerValidator.ValidateAndThrowAsync(request, cancellationToken);

        var email = request.Email.Trim().ToLowerInvariant();
        var emailExists = await _dbContext.Users.AnyAsync(x => x.Email == email, cancellationToken);
        if (emailExists)
        {
            throw new ConflictException("Email is already registered.");
        }

        var userRole = await _dbContext.Roles.FirstOrDefaultAsync(x => x.Name == "User", cancellationToken);
        if (userRole is null)
        {
            throw new InvalidOperationException("Default User role is not configured.");
        }

        var user = new User
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = email,
            RoleId = userRole.Id,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        user.Role = userRole;
        return BuildAuthResponse(user, userRole.Name);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        await _loginValidator.ValidateAndThrowAsync(request, cancellationToken);

        var email = request.Email.Trim().ToLowerInvariant();
        var user = await _dbContext.Users
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Email == email, cancellationToken);

        if (user is null)
        {
            throw new AuthenticationException("Invalid email or password.");
        }

        var verifyResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verifyResult == PasswordVerificationResult.Failed)
        {
            throw new AuthenticationException("Invalid email or password.");
        }

        return BuildAuthResponse(user, user.Role.Name);
    }

    public async Task<CurrentUserResponse?> GetCurrentUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Users
            .Where(x => x.Id == userId)
            .Select(x => new CurrentUserResponse
            {
                Id = x.Id,
                FirstName = x.FirstName,
                LastName = x.LastName,
                Email = x.Email,
                Role = x.Role.Name
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    private AuthResponse BuildAuthResponse(User user, string roleName)
    {
        var tokenResult = _jwtTokenGenerator.Generate(user, roleName);

        return new AuthResponse
        {
            Token = tokenResult.Token,
            ExpiresAtUtc = tokenResult.ExpiresAtUtc,
            User = new CurrentUserResponse
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = roleName
            }
        };
    }
}
