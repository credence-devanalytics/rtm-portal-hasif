import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

const CalendarDatePicker = () => {
  const [selectedDateRange, setSelectedDateRange] = useState({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Default to last 7 days
    to: new Date()
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [tempRange, setTempRange] = useState(selectedDateRange);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateInRange = (date, from, to) => {
    if (!date || !from || !to) return false;
    const dateTime = date.getTime();
    return dateTime >= from.getTime() && dateTime <= to.getTime();
  };

  const isDateSelected = (date, from, to) => {
    if (!date || !from || !to) return false;
    const dateTime = date.getTime();
    return dateTime === from.getTime() || dateTime === to.getTime();
  };

  const handleDateClick = (date) => {
    if (!tempRange.from || (tempRange.from && tempRange.to)) {
      // Start new selection
      setTempRange({ from: date, to: null });
    } else if (tempRange.from && !tempRange.to) {
      // Complete the range
      if (date >= tempRange.from) {
        setTempRange({ from: tempRange.from, to: date });
      } else {
        setTempRange({ from: date, to: tempRange.from });
      }
    }
  };

  const applySelection = () => {
    if (tempRange.from && tempRange.to) {
      setSelectedDateRange(tempRange);
    }
    setShowCalendar(false);
  };

  const cancelSelection = () => {
    setTempRange(selectedDateRange);
    setShowCalendar(false);
  };

  const currentMonth = new Date();
  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setShowCalendar(!showCalendar)}
        className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
        <span className="text-sm">
          {selectedDateRange.from && selectedDateRange.to 
            ? `${formatDate(selectedDateRange.from)} - ${formatDate(selectedDateRange.to)}`
            : 'Select date range'
          }
        </span>
      </button>

      {/* Calendar Dropdown */}
      {showCalendar && (
        <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 w-80">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">{monthYear}</h3>
            <div className="flex gap-2">
              <button
                onClick={cancelSelection}
                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={applySelection}
                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                disabled={!tempRange.from || !tempRange.to}
              >
                Apply
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <div key={index} className="h-8" />;
              }

              const isInRange = isDateInRange(date, tempRange.from, tempRange.to);
              const isSelected = isDateSelected(date, tempRange.from, tempRange.to);
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateClick(date)}
                  className={`
                    h-8 text-xs rounded-md transition-colors
                    ${isSelected 
                      ? 'bg-blue-600 text-white' 
                      : isInRange 
                        ? 'bg-blue-100 text-blue-800' 
                        : isToday 
                          ? 'bg-gray-200 text-gray-900 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Quick Selection Options */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-2">Quick select:</div>
            <div className="flex gap-2 flex-wrap">
              {[
                { label: 'Last 7 days', days: 7 },
                { label: 'Last 30 days', days: 30 },
                { label: 'Last 90 days', days: 90 }
              ].map(option => (
                <button
                  key={option.days}
                  onClick={() => {
                    const to = new Date();
                    const from = new Date(Date.now() - option.days * 24 * 60 * 60 * 1000);
                    setTempRange({ from, to });
                  }}
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarDatePicker;