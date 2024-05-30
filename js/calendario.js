document.addEventListener('DOMContentLoaded', () => {
    const calendarTitle = document.getElementById('calendar-title');
    const calendarBody = document.getElementById('calendar-body');
    const eventModal = document.getElementById('event-modal');
    const eventDate = document.getElementById('event-date');
    const eventTime = document.getElementById('event-time');
    const eventDescription = document.getElementById('event-description');
    const eventParticipants = document.getElementById('event-participants');
    const modalTitle = document.getElementById('modal-title');

    let currentDate = new Date();
    let currentView = 'monthly';
    let events = JSON.parse(localStorage.getItem('calendarEvents')) || {};
    let selectedDate;

    function createEventTimeOptions() {
        const times = [];
        for (let hour = 0; hour < 24; hour++) {
            ["00", "30"].forEach(minute => {
                times.push(`${hour.toString().padStart(2, '0')}:${minute}`);
            });
        }
        return times;
    }

    function populateEventTimeOptions() {
        createEventTimeOptions().forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.text = time;
            eventTime.appendChild(option);
        });
    }

    function updateCalendar() {
        calendarBody.innerHTML = '';
        if (currentView === 'monthly') {
            updateMonthlyView();
        } else if (currentView === 'yearly') {
            updateYearlyView();
        } else if (currentView === 'daily') {
            updateDailyView();
        }
    }

    function updateMonthlyView() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay();

        calendarTitle.innerText = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

        for (let i = 0; i < firstDay; i++) {
            calendarBody.appendChild(document.createElement('div'));
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = createDayElement(year, month, day);
            calendarBody.appendChild(dayElement);
        }
    }

    function createDayElement(year, month, day) {
        const dayElement = document.createElement('div');
        dayElement.innerText = day;
        const dateKey = `${year}-${month + 1}-${day}`;
        if (events[dateKey]) {
            dayElement.classList.add('event');
            dayElement.title = `${events[dateKey].description}\n${events[dateKey].participants}`;
        }
        if (day === currentDate.getDate() && month === new Date().getMonth() && year === new Date().getFullYear()) {
            dayElement.classList.add('today');
        }
        dayElement.onclick = () => openModal(dateKey);
        return dayElement;
    }

    function updateYearlyView() {
        const year = currentDate.getFullYear();
        calendarTitle.innerText = `${year}`;
        calendarBody.style.gridTemplateColumns = 'repeat(3, 1fr)';

        for (let month = 0; month < 12; month++) {
            const monthElement = createMonthElement(year, month);
            calendarBody.appendChild(monthElement);
        }
    }

    function createMonthElement(year, month) {
        const monthElement = document.createElement('div');
        monthElement.innerText = new Date(year, month).toLocaleString('default', { month: 'long' });
        monthElement.style.cssText = 'background: #007BFF; color: #fff; padding: 10px; margin: 5px; border-radius: 5px;';
        monthElement.onclick = () => {
            currentDate.setMonth(month);
            currentView = 'monthly';
            updateCalendar();
        };
        return monthElement;
    }

    function updateDailyView() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const day = currentDate.getDate();
        const dateKey = `${year}-${month + 1}-${day}`;
        calendarTitle.innerText = `${day} de ${currentDate.toLocaleString('default', { month: 'long' })}, ${year}`;
        calendarBody.style.gridTemplateColumns = '1fr';

        const dayElement = createDayDetailsElement(dateKey);
        calendarBody.appendChild(dayElement);
    }

    function createDayDetailsElement(dateKey) {
        const dayElement = document.createElement('div');
        dayElement.innerText = `Hoy es ${currentDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
        dayElement.style.cssText = 'padding: 20px; background: #007BFF; color: #fff; border-radius: 5px;';

        const eventText = events[dateKey] ? `Evento: ${events[dateKey].description}\nParticipantes: ${events[dateKey].participants}` : 'No hay eventos';
        const eventElement = document.createElement('div');
        eventElement.innerText = eventText;
        eventElement.style.color = 'black';
        eventElement.style.marginTop = '10px';

        dayElement.appendChild(eventElement);
        return dayElement;
    }

    function prev() {
        if (currentView === 'monthly') {
            currentDate.setMonth(currentDate.getMonth() - 1);
        } else if (currentView === 'yearly') {
            currentDate.setFullYear(currentDate.getFullYear() - 1);
        } else if (currentView === 'daily') {
            currentDate.setDate(currentDate.getDate() - 1);
        }
        updateCalendar();
    }

    function next() {
        if (currentView === 'monthly') {
            currentDate.setMonth(currentDate.getMonth() + 1);
        } else if (currentView === 'yearly') {
            currentDate.setFullYear(currentDate.getFullYear() + 1);
        } else if (currentView === 'daily') {
            currentDate.setDate(currentDate.getDate() + 1);
        }
        updateCalendar();
    }

    function showMonthlyView() {
        currentView = 'monthly';
        calendarBody.style.gridTemplateColumns = 'repeat(7, 1fr)';
        updateCalendar();
    }

    function showYearlyView() {
        currentView = 'yearly';
        calendarBody.style.gridTemplateColumns = 'repeat(3, 1fr)';
        updateCalendar();
    }

    function showDailyView() {
        currentView = 'daily';
        calendarBody.style.gridTemplateColumns = '1fr';
        updateCalendar();
    }

    function openModal(dateKey) {
        selectedDate = dateKey;
        modalTitle.innerText = `Gestionar Evento para ${new Date(dateKey).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`;
        if (events[dateKey]) {
            eventDate.value = dateKey;
            eventTime.value = events[dateKey].time;
            eventDescription.value = events[dateKey].description;
            eventParticipants.value = events[dateKey].participants;
        } else {
            eventDate.value = dateKey;
            eventTime.value = "00:00";
            eventDescription.value = '';
            eventParticipants.value = '';
        }
        eventModal.style.display = 'flex';
    }

    function closeModal() {
        eventModal.style.display = 'none';
    }

    function saveEvent() {
        const event = {
            date: selectedDate,
            time: eventTime.value,
            description: eventDescription.value.trim(),
            participants: eventParticipants.value.trim()
        };
        events[selectedDate] = event;
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        closeModal();
        updateCalendar();
    }

    function deleteEvent() {
        delete events[selectedDate];
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        closeModal();
        updateCalendar();
    }

    populateEventTimeOptions();
    updateCalendar();

   
    window.prev = prev;
    window.next = next;
    window.showMonthlyView = showMonthlyView;
    window.showYearlyView = showYearlyView;
    window.showDailyView = showDailyView;
    window.saveEvent = saveEvent;
    window.deleteEvent = deleteEvent;
    window.closeModal = closeModal;
});
