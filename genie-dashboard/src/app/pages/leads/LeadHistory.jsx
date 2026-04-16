import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Phone,
    Mail,
    Calendar,
    FileText,
    User,
    Clock,
    MessageSquare,
    Edit,
    Trash2,
    Plus,
    Filter,
    Download
} from 'lucide-react';
import DashboardLayout from '../../layout/DashboardLayout'

function LeadHistory() {
    const { id } = useParams();
    const [activeFilter, setActiveFilter] = useState('all');

    // Mock lead data
    const lead = {
        id: id,
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        course: 'MBA'
    };

    // Mock activity history
    const activities = [
        {
            id: '1',
            type: 'call',
            title: 'Phone Call - Program Discussion',
            description: 'Discussed MBA program details, curriculum structure, and scholarship opportunities. Sarah showed high interest in the evening program format.',
            timestamp: '2024-01-20T14:30:00Z',
            duration: '15 minutes',
            user: 'Michael Brown',
            userRole: 'Senior Counselor',
            outcome: 'Positive',
            nextAction: 'Send program brochure',
            attachments: ['call_recording_20240120.mp3']
        },
        {
            id: '2',
            type: 'email',
            title: 'Email - Program Brochure Sent',
            description: 'Sent comprehensive MBA program brochure including curriculum details, faculty information, and admission requirements.',
            timestamp: '2024-01-20T11:15:00Z',
            user: 'Michael Brown',
            userRole: 'Senior Counselor',
            emailSubject: 'MBA Program Information - Springfield University',
            attachments: ['mba_brochure_2024.pdf', 'admission_requirements.pdf']
        },
        {
            id: '3',
            type: 'note',
            title: 'Lead Qualification Note',
            description: 'Lead is very interested in evening MBA program. Has 5 years of marketing experience and wants to transition to leadership role. Budget confirmed at $50k.',
            timestamp: '2024-01-20T10:45:00Z',
            user: 'Michael Brown',
            userRole: 'Senior Counselor',
            tags: ['Qualified', 'Budget Confirmed', 'Evening Program']
        },
        {
            id: '4',
            type: 'status',
            title: 'Status Update - Warm to Hot',
            description: 'Lead status updated from Warm to Hot based on engagement level and qualification criteria.',
            timestamp: '2024-01-20T10:30:00Z',
            user: 'System',
            userRole: 'Automated',
            previousStatus: 'Warm',
            newStatus: 'Hot'
        },
        {
            id: '5',
            type: 'meeting',
            title: 'Campus Visit Scheduled',
            description: 'Scheduled campus visit for January 25th at 2:00 PM. Will include tour of facilities and meeting with program director.',
            timestamp: '2024-01-19T16:20:00Z',
            user: 'Michael Brown',
            userRole: 'Senior Counselor',
            meetingDate: '2024-01-25T14:00:00Z',
            location: 'Main Campus - Admin Building'
        },
        {
            id: '6',
            type: 'form',
            title: 'Application Form Submitted',
            description: 'Lead submitted initial application form through website. All required fields completed.',
            timestamp: '2024-01-19T14:15:00Z',
            user: 'Sarah Johnson',
            userRole: 'Lead',
            formType: 'Initial Application',
            completionRate: '100%'
        },
        {
            id: '7',
            type: 'assignment',
            title: 'Lead Assigned',
            description: 'Lead assigned to Michael Brown based on MBA specialization and availability.',
            timestamp: '2024-01-19T14:00:00Z',
            user: 'Admin System',
            userRole: 'System',
            assignedTo: 'Michael Brown',
            assignedBy: 'Emma Davis'
        }
    ];

    const getActivityIcon = (type) => {
        switch (type) {
            case 'call':
                return <Phone className="w-5 h-5 text-green-600" />;
            case 'email':
                return <Mail className="w-5 h-5 text-blue-600" />;
            case 'note':
                return <FileText className="w-5 h-5 text-purple-600" />;
            case 'status':
                return <Edit className="w-5 h-5 text-orange-600" />;
            case 'meeting':
                return <Calendar className="w-5 h-5 text-indigo-600" />;
            case 'form':
                return <FileText className="w-5 h-5 text-teal-600" />;
            case 'assignment':
                return <User className="w-5 h-5 text-gray-600" />;
            default:
                return <Clock className="w-5 h-5 text-gray-600" />;
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'call':
                return 'bg-green-50 border-green-200';
            case 'email':
                return 'bg-blue-50 border-blue-200';
            case 'note':
                return 'bg-purple-50 border-purple-200';
            case 'status':
                return 'bg-orange-50 border-orange-200';
            case 'meeting':
                return 'bg-indigo-50 border-indigo-200';
            case 'form':
                return 'bg-teal-50 border-teal-200';
            case 'assignment':
                return 'bg-gray-50 border-gray-200';
            default:
                return 'bg-gray-50 border-gray-200';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredActivities = activities.filter(activity => {
        if (activeFilter === 'all') return true;
        return activity.type === activeFilter;
    });

    const activityTypes = [
        { value: 'all', label: 'All Activities', count: activities.length },
        { value: 'call', label: 'Calls', count: activities.filter(a => a.type === 'call').length },
        { value: 'email', label: 'Emails', count: activities.filter(a => a.type === 'email').length },
        { value: 'note', label: 'Notes', count: activities.filter(a => a.type === 'note').length },
        { value: 'meeting', label: 'Meetings', count: activities.filter(a => a.type === 'meeting').length }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link
                            to={`/leads/view/${id}`}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Lead History - 💥BOOM</h1>
                            <p className="text-gray-600">{lead.name} - Complete Activity Timeline</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </button>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Activity
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Activity Timeline</h2>
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                            <Filter className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {activityTypes.map((type) => (
                            <button
                                key={type.value}
                                onClick={() => setActiveFilter(type.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeFilter === type.value
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {type.label} ({type.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Activity Timeline */}
                <div className="space-y-4">
                    {filteredActivities.map((activity, index) => (
                        <div
                            key={activity.id}
                            className={`bg-white rounded-lg shadow-sm border p-6 ${getActivityColor(activity.type)}`}
                        >
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 rounded-full bg-white border-2 border-current flex items-center justify-center">
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-medium text-gray-900">{activity.title}</h3>
                                            <p className="text-gray-600 mt-1">{activity.description}</p>

                                            {/* Activity-specific details */}
                                            {activity.type === 'call' && (
                                                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium text-gray-700">Duration:</span>
                                                        <span className="ml-2 text-gray-600">{activity.duration}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-700">Outcome:</span>
                                                        <span className="ml-2 text-gray-600">{activity.outcome}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-700">Next Action:</span>
                                                        <span className="ml-2 text-gray-600">{activity.nextAction}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {activity.type === 'email' && activity.emailSubject && (
                                                <div className="mt-3 text-sm">
                                                    <span className="font-medium text-gray-700">Subject:</span>
                                                    <span className="ml-2 text-gray-600">{activity.emailSubject}</span>
                                                </div>
                                            )}

                                            {activity.type === 'status' && (
                                                <div className="mt-3 text-sm">
                                                    <span className="font-medium text-gray-700">Status Change:</span>
                                                    <span className="ml-2 text-gray-600">
                                                        {activity.previousStatus} → {activity.newStatus}
                                                    </span>
                                                </div>
                                            )}

                                            {activity.type === 'meeting' && (
                                                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium text-gray-700">Scheduled:</span>
                                                        <span className="ml-2 text-gray-600">{formatDate(activity.meetingDate)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-700">Location:</span>
                                                        <span className="ml-2 text-gray-600">{activity.location}</span>
                                                    </div>
                                                </div>
                                            )}

                                            {activity.type === 'note' && activity.tags && (
                                                <div className="mt-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        {activity.tags.map((tag, tagIndex) => (
                                                            <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {activity.attachments && activity.attachments.length > 0 && (
                                                <div className="mt-3">
                                                    <span className="text-sm font-medium text-gray-700">Attachments:</span>
                                                    <div className="mt-1 flex flex-wrap gap-2">
                                                        {activity.attachments.map((attachment, attachIndex) => (
                                                            <button
                                                                key={attachIndex}
                                                                className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                                                            >
                                                                <Download className="w-3 h-3 mr-1" />
                                                                {attachment}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right text-sm text-gray-500 ml-4">
                                            <div>{formatDate(activity.timestamp)}</div>
                                            <div className="mt-1">
                                                <span className="font-medium">{activity.user}</span>
                                                <div className="text-xs">{activity.userRole}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary Stats */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{activities.filter(a => a.type === 'call').length}</div>
                            <div className="text-sm text-gray-600">Total Calls</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{activities.filter(a => a.type === 'email').length}</div>
                            <div className="text-sm text-gray-600">Emails Sent</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{activities.filter(a => a.type === 'note').length}</div>
                            <div className="text-sm text-gray-600">Notes Added</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{activities.filter(a => a.type === 'meeting').length}</div>
                            <div className="text-sm text-gray-600">Meetings</div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}

export default LeadHistory
