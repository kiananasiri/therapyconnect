from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PatientViewSet, TherapistViewSet, SessionViewSet, PaymentViewSet,
    ChatViewSet, MessageViewSet, ChatRoomViewSet, ReviewViewSet, NotebookViewSet, PageViewSet,
    AvailabilityViewSet, TherapistLoginView, TherapistLogoutView, TherapistRefreshTokenView
)

router = DefaultRouter()
router.register(r'patients', PatientViewSet)
router.register(r'therapists', TherapistViewSet)
router.register(r'sessions', SessionViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'chats', ChatViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'chat-rooms', ChatRoomViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'notebooks', NotebookViewSet)
router.register(r'pages', PageViewSet)
router.register(r'availabilities', AvailabilityViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('therapist-login/', TherapistLoginView.as_view(), name='therapist-login'),
    path('therapist-logout/', TherapistLogoutView.as_view(), name='therapist-logout'),
    path('therapist-refresh/', TherapistRefreshTokenView.as_view(), name='therapist-refresh'),
]
