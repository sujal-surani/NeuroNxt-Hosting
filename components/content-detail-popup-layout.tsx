import React from "react"
import { Heart, Bookmark, Share, Download, Play, ExternalLink, Star, Clock, Eye, User, BookOpen, Target } from "lucide-react"

export function ContentDetailPopupLayout() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Advanced React Hooks and State Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Comprehensive guide covering useState, useEffect, custom hooks, and advanced patterns for modern React development
              </p>
              
              {/* Teacher, Rating, Duration */}
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>Sarah Johnson</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>25:30</span>
                </div>
              </div>

              {/* Tags Row */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-sm font-medium">
                  Text
                </span>
                <span className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-sm font-medium">
                  React
                </span>
                <span className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-sm font-medium">
                  Advanced
                </span>
                <span className="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-sm font-medium">
                  JavaScript
                </span>
              </div>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-3 ml-4">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Heart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Bookmark className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Share className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Main Content */}
          <div className="flex-1 p-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 pb-2 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content Preview</h3>
              
              {/* Text Content Layout */}
                <div className="space-y-3">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
                  Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, 
                  totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
                </p>
              </div>

              {/* Video Content Layout (Alternative) */}
              {/* 
              <div className="bg-black rounded-lg aspect-video flex items-center justify-center mb-4">
                <div className="text-center text-white">
                  <Play className="w-12 h-12 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Video Content</h3>
                  <p className="text-sm text-gray-300">Duration: 25:30</p>
                </div>
              </div>
              */}
            </div>
          </div>

          {/* Right Side - Details Panel */}
          <div className="w-full lg:w-80 p-6 bg-gray-50 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Details</h3>
              
              {/* Detail Fields */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Teacher</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Sarah Johnson</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Subject</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Web Development</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Target className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Difficulty</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Advanced</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Reading Time</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">15 min read</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">1,247</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Word Count</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">2,450 words</p>
                  </div>
                </div>
              </div>

              {/* Tags Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-sm">
                    React
                  </span>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-sm">
                    Hooks
                  </span>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-sm">
                    State Management
                  </span>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-sm">
                    JavaScript
                  </span>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-sm">
                    Frontend
                  </span>
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-sm">
                    Tutorial
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Action Buttons */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-center gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
              <Play className="w-4 h-4" />
              Play
            </button>
            <button className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors">
              <ExternalLink className="w-4 h-4" />
              Open
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
