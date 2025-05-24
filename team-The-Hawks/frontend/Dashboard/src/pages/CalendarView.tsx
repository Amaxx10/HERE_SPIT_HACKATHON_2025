import { useState } from "react";
import { format, addDays, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, addMonths, subMonths, addWeeks, subWeeks } from "date-fns";
import { Calendar, ChevronLeft, ChevronRight, Plus, X, Edit, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
interface EventType {
  id: number;
  title: string;
  date: Date;
  type: "promotion" | "staffing" | "delivery" | "inventory";
  description: string;
  time?: string;
}

const CalendarView = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  const [events, setEvents] = useState<EventType[]>([
    {
      id: 1,
      title: "Summer Sale Launch",
      date: new Date(),
      type: "promotion",
      description: "Major seasonal promotion with 30% discount on summer items",
      time: "09:00"
    },
    {
      id: 2,
      title: "Staff Training",
      date: addDays(new Date(), 2),
      type: "staffing",
      description: "New POS system training for all cashiers",
      time: "14:00"
    },
    {
      id: 3,
      title: "Large Inventory Delivery",
      date: addDays(new Date(), 3),
      type: "delivery",
      description: "Receiving new fall collection items",
      time: "10:30"
    },
    {
      id: 4,
      title: "Weekend Flash Sale",
      date: addDays(new Date(), 5),
      type: "promotion",
      description: "12-hour flash sale with limited quantities",
      time: "08:00"
    },
    {
      id: 5,
      title: "Inventory Check",
      date: addDays(new Date(), -1),
      type: "inventory",
      description: "Monthly inventory verification",
      time: "16:00"
    },
    {
      id: 6,
      title: "Staff Schedule Update",
      date: addDays(new Date(), 1),
      type: "staffing",
      description: "Revised shift assignments for coming week",
      time: "11:00"
    }
  ]);

  const [newEvent, setNewEvent] = useState<Partial<EventType>>({
    title: "",
    description: "",
    type: "promotion",
    time: "09:00"
  });

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const getEventsForDate = (targetDate: Date) => {
    return events.filter(event => isSameDay(event.date, targetDate));
  };

  const handleEventClick = (event: EventType) => {
    setSelectedEvent(event);
    setShowEventModal(true);
    setIsEditing(false);
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setNewEvent({
      title: "",
      description: "",
      type: "promotion",
      time: "09:00"
    });
    setShowEventModal(true);
    setIsEditing(true);
  };

  const handleSaveEvent = () => {
    if (selectedEvent && isEditing) {
      // Update existing event
      setEvents(prev => prev.map(event => 
        event.id === selectedEvent.id ? selectedEvent : event
      ));
      showToast("Event updated successfully!");
    } else if (isEditing && newEvent.title) {
      // Create new event
      const event: EventType = {
        id: Math.max(...events.map(e => e.id), 0) + 1,
        title: newEvent.title!,
        description: newEvent.description!,
        type: newEvent.type!,
        date: date,
        time: newEvent.time
      };
      setEvents(prev => [...prev, event]);
      showToast("Event created successfully!");
    }
    setShowEventModal(false);
    setIsEditing(false);
  };

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(prev => prev.filter(event => event.id !== selectedEvent.id));
      showToast("Event deleted successfully!");
      setShowEventModal(false);
    }
  };

  const navigateCalendar = (direction: "prev" | "next") => {
    if (view === "month") {
      setDate(direction === "prev" ? subMonths(date, 1) : addMonths(date, 1));
    } else if (view === "week") {
      setDate(direction === "prev" ? subWeeks(date, 1) : addWeeks(date, 1));
    } else {
      setDate(direction === "prev" ? addDays(date, -1) : addDays(date, 1));
    }
  };

  const renderMiniCalendar = () => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="grid grid-cols-7 gap-1 text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-xs font-medium text-gray-500 p-1">{day}</div>
        ))}
        {days.map(day => {
          const hasEvents = events.some(event => isSameDay(event.date, day));
          const isCurrentMonth = day.getMonth() === date.getMonth();
          const isSelected = isSameDay(day, date);
          const isToday = isSameDay(day, new Date());
          
          return (
            <button
              key={day.toISOString()}
              onClick={() => setDate(day)}
              className={`
                p-1 text-xs rounded hover:bg-blue-100 transition-colors
                ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                ${isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
                ${isToday && !isSelected ? 'bg-blue-50 font-semibold' : ''}
                ${hasEvents ? 'font-bold' : ''}
              `}
            >
              {day.getDate()}
              {hasEvents && (
                <div className="w-1 h-1 bg-red-500 rounded-full mx-auto mt-0.5"></div>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div className="grid grid-cols-7 gap-2">
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
          <div key={day} className="text-center font-medium text-gray-600 p-2 border-b">
            {day}
          </div>
        ))}
        {days.map(day => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = day.getMonth() === date.getMonth();
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={day.toISOString()}
              className={`
                border rounded-lg p-2 min-h-[120px] cursor-pointer hover:bg-gray-50 transition-colors
                ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                ${isToday ? 'bg-blue-50 border-blue-200' : ''}
              `}
              onClick={() => setDate(day)}
            >
              <div className={`font-medium text-sm mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className={`
                      text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity
                      ${event.type === "promotion" ? "bg-green-100 text-green-800" : ""}
                      ${event.type === "staffing" ? "bg-yellow-100 text-yellow-800" : ""}
                      ${event.type === "delivery" ? "bg-blue-100 text-blue-800" : ""}
                      ${event.type === "inventory" ? "bg-red-100 text-red-800" : ""}
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEventClick(event);
                    }}
                  >
                    {event.time && `${event.time} `}{event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500">+{dayEvents.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(date);
    const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(date) });

    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => {
          const dayEvents = getEventsForDate(day);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={day.toISOString()}
              className={`
                border rounded-lg p-3 min-h-[200px]
                ${isToday ? 'bg-blue-50 border-blue-200' : ''}
              `}
            >
              <div className={`font-medium text-center mb-2 ${isToday ? 'text-blue-600' : ''}`}>
                <div>{format(day, 'EEEE')}</div>
                <div className="text-lg">{format(day, 'd')}</div>
              </div>
              <div className="space-y-1">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className={`
                      text-xs p-2 rounded cursor-pointer hover:opacity-80 transition-opacity
                      ${event.type === "promotion" ? "bg-green-100 text-green-800" : ""}
                      ${event.type === "staffing" ? "bg-yellow-100 text-yellow-800" : ""}
                      ${event.type === "delivery" ? "bg-blue-100 text-blue-800" : ""}
                      ${event.type === "inventory" ? "bg-red-100 text-red-800" : ""}
                    `}
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="font-medium">{event.time && `${event.time} `}{event.title}</div>
                    <div className="text-xs opacity-75">{event.description}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const dayEvents = getEventsForDate(date);
    const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

    return (
      <div className="space-y-2">
        <div className="text-center font-medium p-4 bg-blue-50 rounded-lg">
          {format(date, 'EEEE, MMMM d, yyyy')}
        </div>
        {hours.map(hour => (
          <div key={hour} className="flex border-b py-3">
            <div className="w-20 text-sm text-gray-500 font-medium">
              {hour === 12 ? '12:00 PM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
            </div>
            <div className="flex-1 min-h-[50px] pl-4">
              {dayEvents
                .filter(event => event.time && parseInt(event.time.split(':')[0]) === hour)
                .map(event => (
                  <div
                    key={event.id}
                    className={`
                      p-2 mb-1 rounded cursor-pointer hover:opacity-80 transition-opacity
                      ${event.type === "promotion" ? "bg-green-100 text-green-800" : ""}
                      ${event.type === "staffing" ? "bg-yellow-100 text-yellow-800" : ""}
                      ${event.type === "delivery" ? "bg-blue-100 text-blue-800" : ""}
                      ${event.type === "inventory" ? "bg-red-100 text-red-800" : ""}
                    `}
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm opacity-75">{event.description}</div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const selectedDateEvents = getEventsForDate(date);

  return (
    <>
    <DashboardLayout>
    
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toastMessage}
        </div>
      )}
 
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Calendar</h1>
        <div className="flex items-center space-x-4">
          {/* View Tabs */}
          <div className="flex bg-white rounded-lg border">
            {['month', 'week', 'day'].map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType as typeof view)}
                className={`
                  px-4 py-2 text-sm font-medium rounded-lg transition-colors
                  ${view === viewType 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
                  }
                `}
              >
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              </button>
            ))}
          </div>
          
          <button
            onClick={handleCreateEvent}
            className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center mb-4">
              <Calendar className="h-5 w-5 mr-2 text-blue-500" />
              <h2 className="font-semibold text-gray-800">Calendar</h2>
            </div>
            
            {renderMiniCalendar()}
            
            {/* Legend */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Event Types</h3>
              <div className="space-y-2">
                {[
                  { type: 'promotion', color: 'bg-green-100 text-green-800', label: 'Promotions' },
                  { type: 'staffing', color: 'bg-yellow-100 text-yellow-800', label: 'Staffing' },
                  { type: 'delivery', color: 'bg-blue-100 text-blue-800', label: 'Deliveries' },
                  { type: 'inventory', color: 'bg-red-100 text-red-800', label: 'Inventory' }
                ].map(({ type, color, label }) => (
                  <div key={type} className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${color.split(' ')[0]} mr-2`}></div>
                    <span className="text-sm text-gray-600">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Events */}
            {selectedDateEvents.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Events on {format(date, 'MMM d')}
                </h3>
                <div className="space-y-2">
                  {selectedDateEvents.map(event => (
                    <div
                      key={event.id}
                      className="p-2 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleEventClick(event)}
                    >
                      <div className="font-medium text-sm">{event.title}</div>
                      <div className="text-xs text-gray-500">
                        {event.time} • {event.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                {view === "month" ? format(date, "MMMM yyyy") :
                 view === "week" ? `Week of ${format(startOfWeek(date), "MMM d")}` :
                 format(date, "EEEE, MMMM d, yyyy")}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateCalendar("prev")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setDate(new Date())}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={() => navigateCalendar("next")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {view === "month" && renderMonthView()}
              {view === "week" && renderWeekView()}
              {view === "day" && renderDayView()}
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {isEditing ? (selectedEvent ? 'Edit Event' : 'Create Event') : 'Event Details'}
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={selectedEvent ? selectedEvent.title : newEvent.title}
                    onChange={(e) => {
                      if (selectedEvent) {
                        setSelectedEvent({...selectedEvent, title: e.target.value});
                      } else {
                        setNewEvent({...newEvent, title: e.target.value});
                      }
                    }}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Event title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={selectedEvent ? selectedEvent.type : newEvent.type}
                    onChange={(e) => {
                      const type = e.target.value as EventType['type'];
                      if (selectedEvent) {
                        setSelectedEvent({...selectedEvent, type});
                      } else {
                        setNewEvent({...newEvent, type});
                      }
                    }}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="promotion">Promotion</option>
                    <option value="staffing">Staffing</option>
                    <option value="delivery">Delivery</option>
                    <option value="inventory">Inventory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={selectedEvent ? selectedEvent.time : newEvent.time}
                    onChange={(e) => {
                      if (selectedEvent) {
                        setSelectedEvent({...selectedEvent, time: e.target.value});
                      } else {
                        setNewEvent({...newEvent, time: e.target.value});
                      }
                    }}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={selectedEvent ? selectedEvent.description : newEvent.description}
                    onChange={(e) => {
                      if (selectedEvent) {
                        setSelectedEvent({...selectedEvent, description: e.target.value});
                      } else {
                        setNewEvent({...newEvent, description: e.target.value});
                      }
                    }}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Event description"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleSaveEvent}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {selectedEvent ? 'Update' : 'Create'}
                  </button>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : selectedEvent ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-lg">{selectedEvent.title}</h4>
                  <div className={`
                    inline-block px-2 py-1 rounded text-xs font-medium mt-1
                    ${selectedEvent.type === "promotion" ? "bg-green-100 text-green-800" : ""}
                    ${selectedEvent.type === "staffing" ? "bg-yellow-100 text-yellow-800" : ""}
                    ${selectedEvent.type === "delivery" ? "bg-blue-100 text-blue-800" : ""}
                    ${selectedEvent.type === "inventory" ? "bg-red-100 text-red-800" : ""}
                  `}>
                    {selectedEvent.type}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  <div><strong>Date:</strong> {format(selectedEvent.date, 'MMMM d, yyyy')}</div>
                  {selectedEvent.time && <div><strong>Time:</strong> {selectedEvent.time}</div>}
                </div>
                
                <p className="text-sm text-gray-700">{selectedEvent.description}</p>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDeleteEvent}
                    className="flex items-center space-x-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        
      )}
    </div>
    </DashboardLayout>
     </>
  );
};

export default CalendarView;