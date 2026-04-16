import { Save } from 'lucide-react'
import React from 'react'

function Notification() {
    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Preferences</h2>
            <div className="space-y-6">
                <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Email Notifications</h3>
                    <div className="space-y-3">
                        <label className="flex items-center">
                            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="ml-3 text-sm text-gray-700">New lead assignments</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="ml-3 text-sm text-gray-700">Follow-up reminders</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="ml-3 text-sm text-gray-700">Weekly performance reports</span>
                        </label>
                    </div>
                </div>

                <div>
                    <h3 className="text-md font-medium text-gray-900 mb-4">Push Notifications</h3>
                    <div className="space-y-3">
                        <label className="flex items-center">
                            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="ml-3 text-sm text-gray-700">Urgent lead updates</span>
                        </label>
                        <label className="flex items-center">
                            <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                            <span className="ml-3 text-sm text-gray-700">Team messages</span>
                        </label>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                        <Save className="w-4 h-4 mr-2" />
                        Save Preferences
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Notification
