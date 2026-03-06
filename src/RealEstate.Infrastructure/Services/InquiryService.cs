using System.Linq.Expressions;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using RealEstate.Application.DTOs.Inquiries;
using RealEstate.Application.Exceptions;
using RealEstate.Application.Interfaces;
using RealEstate.Domain.Entities;
using RealEstate.Domain.Enums;
using RealEstate.Infrastructure.Persistence;

namespace RealEstate.Infrastructure.Services;

public class InquiryService : IInquiryService
{
    private readonly RealEstateDbContext _dbContext;
    private readonly IValidator<CreateInquiryRequest> _createValidator;
    private readonly IValidator<UpdateInquiryStatusRequest> _statusValidator;

    public InquiryService(
        RealEstateDbContext dbContext,
        IValidator<CreateInquiryRequest> createValidator,
        IValidator<UpdateInquiryStatusRequest> statusValidator)
    {
        _dbContext = dbContext;
        _createValidator = createValidator;
        _statusValidator = statusValidator;
    }

    public async Task<InquiryDetailsResponse> CreateAsync(int userId, CreateInquiryRequest request, CancellationToken cancellationToken = default)
    {
        await _createValidator.ValidateAndThrowAsync(request, cancellationToken);

        var property = await _dbContext.Properties
            .AsNoTracking()
            .Where(x => x.Id == request.PropertyId)
            .Select(x => new { x.Id, x.Status })
            .FirstOrDefaultAsync(cancellationToken);

        if (property is null)
        {
            throw new NotFoundException("Property not found.");
        }

        if (property.Status != PropertyStatus.Published)
        {
            throw new BadRequestException("Property is not available for inquiries.");
        }

        var inquiry = new Inquiry
        {
            PropertyId = request.PropertyId,
            UserId = userId,
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim(),
            PhoneNumber = request.PhoneNumber?.Trim(),
            Message = request.Message.Trim(),
            Status = InquiryStatus.New
        };

        _dbContext.Inquiries.Add(inquiry);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return await GetByIdInternalAsync(inquiry.Id, cancellationToken)
            ?? throw new NotFoundException("Inquiry not found after creation.");
    }

    public async Task<IReadOnlyList<InquiryListItemResponse>> GetMyAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Inquiries
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(MapListProjection())
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<InquiryListItemResponse>> GetAgentAsync(int agentUserId, CancellationToken cancellationToken = default)
    {
        var agentProfileId = await _dbContext.AgentProfiles
            .AsNoTracking()
            .Where(x => x.UserId == agentUserId)
            .Select(x => (int?)x.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (!agentProfileId.HasValue)
        {
            throw new ForbiddenException("Agent profile is required.");
        }

        return await _dbContext.Inquiries
            .AsNoTracking()
            .Where(x => x.Property.AgentProfileId == agentProfileId.Value)
            .OrderByDescending(x => x.CreatedAt)
            .Select(MapListProjection())
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<InquiryListItemResponse>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Inquiries
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Select(MapListProjection())
            .ToListAsync(cancellationToken);
    }

    public async Task<InquiryDetailsResponse?> GetByIdAsync(int id, int actorUserId, string actorRole, CancellationToken cancellationToken = default)
    {
        var inquiry = await GetByIdInternalAsync(id, cancellationToken);
        if (inquiry is null)
        {
            return null;
        }

        var canAccess = await CanAccessInquiryAsync(id, actorUserId, actorRole, cancellationToken);
        if (!canAccess)
        {
            throw new ForbiddenException("You are not allowed to access this inquiry.");
        }

        return inquiry;
    }

    public async Task<InquiryDetailsResponse> UpdateStatusAsync(int id, UpdateInquiryStatusRequest request, int actorUserId, string actorRole, CancellationToken cancellationToken = default)
    {
        await _statusValidator.ValidateAndThrowAsync(request, cancellationToken);

        var inquiry = await _dbContext.Inquiries
            .Include(x => x.Property)
                .ThenInclude(x => x.AgentProfile)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (inquiry is null)
        {
            throw new NotFoundException("Inquiry not found.");
        }

        var canManage = actorRole.Equals("Admin", StringComparison.OrdinalIgnoreCase) ||
                        (actorRole.Equals("Agent", StringComparison.OrdinalIgnoreCase) &&
                         inquiry.Property.AgentProfile.UserId == actorUserId);

        if (!canManage)
        {
            throw new ForbiddenException("You are not allowed to update this inquiry.");
        }

        inquiry.Status = request.Status;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return await GetByIdInternalAsync(id, cancellationToken)
            ?? throw new NotFoundException("Inquiry not found.");
    }

    private async Task<bool> CanAccessInquiryAsync(int inquiryId, int actorUserId, string actorRole, CancellationToken cancellationToken)
    {
        if (actorRole.Equals("Admin", StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (actorRole.Equals("Agent", StringComparison.OrdinalIgnoreCase))
        {
            var agentProfileId = await _dbContext.AgentProfiles
                .AsNoTracking()
                .Where(x => x.UserId == actorUserId)
                .Select(x => (int?)x.Id)
                .FirstOrDefaultAsync(cancellationToken);

            return agentProfileId.HasValue &&
                   await _dbContext.Inquiries.AsNoTracking()
                       .AnyAsync(x => x.Id == inquiryId && x.Property.AgentProfileId == agentProfileId.Value, cancellationToken);
        }

        return await _dbContext.Inquiries.AsNoTracking()
            .AnyAsync(x => x.Id == inquiryId && x.UserId == actorUserId, cancellationToken);
    }

    private async Task<InquiryDetailsResponse?> GetByIdInternalAsync(int id, CancellationToken cancellationToken)
    {
        return await _dbContext.Inquiries
            .AsNoTracking()
            .Where(x => x.Id == id)
            .Select(x => new InquiryDetailsResponse
            {
                Id = x.Id,
                PropertyId = x.PropertyId,
                PropertyTitle = x.Property.Title,
                PropertyCity = x.Property.City.Name,
                PropertyArea = x.Property.Area.Name,
                PropertyPrice = x.Property.Price,
                FullName = x.FullName,
                Email = x.Email,
                PhoneNumber = x.PhoneNumber,
                Message = x.Message,
                CreatedAt = x.CreatedAt,
                Status = x.Status,
                User = new InquiryUserSummary
                {
                    Id = x.UserId,
                    FirstName = x.User.FirstName,
                    LastName = x.User.LastName
                },
                Agent = new InquiryAgentSummary
                {
                    AgentProfileId = x.Property.AgentProfileId,
                    UserId = x.Property.AgentProfile.UserId,
                    FirstName = x.Property.AgentProfile.User.FirstName,
                    LastName = x.Property.AgentProfile.User.LastName,
                    Email = x.Property.AgentProfile.User.Email,
                    PhoneNumber = x.Property.AgentProfile.PhoneNumber
                }
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    private static Expression<Func<Inquiry, InquiryListItemResponse>> MapListProjection()
    {
        return x => new InquiryListItemResponse
        {
            Id = x.Id,
            PropertyId = x.PropertyId,
            PropertyTitle = x.Property.Title,
            FullName = x.FullName,
            Email = x.Email,
            PhoneNumber = x.PhoneNumber,
            MessagePreview = x.Message.Length > 120 ? x.Message.Substring(0, 120) + "..." : x.Message,
            CreatedAt = x.CreatedAt,
            Status = x.Status
        };
    }
}
