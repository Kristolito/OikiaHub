using RealEstate.Application.DTOs.Inquiries;

namespace RealEstate.Application.Interfaces;

public interface IInquiryService
{
    Task<InquiryDetailsResponse> CreateAsync(int userId, CreateInquiryRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<InquiryListItemResponse>> GetMyAsync(int userId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<InquiryListItemResponse>> GetAgentAsync(int agentUserId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<InquiryListItemResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<InquiryDetailsResponse?> GetByIdAsync(int id, int actorUserId, string actorRole, CancellationToken cancellationToken = default);
    Task<InquiryDetailsResponse> UpdateStatusAsync(int id, UpdateInquiryStatusRequest request, int actorUserId, string actorRole, CancellationToken cancellationToken = default);
}
