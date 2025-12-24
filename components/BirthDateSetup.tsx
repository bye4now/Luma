import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, X } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHoroscope } from '@/hooks/useHoroscope';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave?: (date: Date) => void;
}

export function BirthDateSetup({ visible, onClose, onSave }: Props) {
  const { saveBirthDate } = useHoroscope();
  const [selectedDate, setSelectedDate] = useState(new Date(1990, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };
  
  const days = Array.from({ length: getDaysInMonth(selectedDate.getFullYear(), selectedDate.getMonth()) }, (_, i) => i + 1);

  const handleSave = async () => {
    if (!isNaN(selectedDate.getTime())) {
      if (onSave) {
        onSave(selectedDate);
      } else {
        await saveBirthDate(selectedDate);
      }
      onClose();
    }
  };

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(year);
    setSelectedDate(newDate);
    setShowYearPicker(false);
  };

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(monthIndex);
    setSelectedDate(newDate);
    setShowMonthPicker(false);
  };

  const handleDaySelect = (day: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(day);
    setSelectedDate(newDate);
    setShowDayPicker(false);
  };

  const formatDisplayDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.heroSection}>
            <View style={styles.iconContainer}>
              <Calendar size={40} color="#667eea" />
            </View>
            <Text style={styles.title}>Set Your Birth Date</Text>
            <Text style={styles.subtitle}>
              Get personalized horoscope readings based on your zodiac sign
            </Text>
          </View>

          <View style={styles.dateSection}>
            <Text style={styles.dateLabel}>Select Your Birth Date</Text>
            
            {Platform.OS !== 'web' && (
              <View style={styles.customPickersRow}>
                <TouchableOpacity 
                  style={styles.customPickerButton}
                  onPress={() => setShowYearPicker(true)}
                >
                  <Text style={styles.customPickerButtonText}>{selectedDate.getFullYear()}</Text>
                  <Text style={styles.customPickerLabel}>Year</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.customPickerButton}
                  onPress={() => setShowMonthPicker(true)}
                >
                  <Text style={styles.customPickerButtonText} numberOfLines={1} adjustsFontSizeToFit>{months[selectedDate.getMonth()]}</Text>
                  <Text style={styles.customPickerLabel}>Month</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.customPickerButton}
                  onPress={() => setShowDayPicker(true)}
                >
                  <Text style={styles.customPickerButtonText}>{selectedDate.getDate()}</Text>
                  <Text style={styles.customPickerLabel}>Day</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <Text style={styles.selectedDateDisplay}>
              Selected: {formatDisplayDate(selectedDate)}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>Save Birth Date</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
          />
        )}
        
        {/* Year Picker Modal */}
        <Modal visible={showYearPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Year</Text>
                <TouchableOpacity onPress={() => setShowYearPicker(false)}>
                  <X size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerScrollView}>
                {years.map(year => (
                  <TouchableOpacity
                    key={year}
                    style={[styles.pickerOption, selectedDate.getFullYear() === year && styles.selectedPickerOption]}
                    onPress={() => handleYearSelect(year)}
                  >
                    <Text style={[styles.pickerOptionText, selectedDate.getFullYear() === year && styles.selectedPickerOptionText]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
        
        {/* Month Picker Modal */}
        <Modal visible={showMonthPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Month</Text>
                <TouchableOpacity onPress={() => setShowMonthPicker(false)}>
                  <X size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerScrollView}>
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.pickerOption, selectedDate.getMonth() === index && styles.selectedPickerOption]}
                    onPress={() => handleMonthSelect(index)}
                  >
                    <Text style={[styles.pickerOptionText, selectedDate.getMonth() === index && styles.selectedPickerOptionText]}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
        
        {/* Day Picker Modal */}
        <Modal visible={showDayPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.pickerModal}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Select Day</Text>
                <TouchableOpacity onPress={() => setShowDayPicker(false)}>
                  <X size={24} color="#666" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.pickerScrollView}>
                {days.map(day => (
                  <TouchableOpacity
                    key={day}
                    style={[styles.pickerOption, selectedDate.getDate() === day && styles.selectedPickerOption]}
                    onPress={() => handleDaySelect(day)}
                  >
                    <Text style={[styles.pickerOptionText, selectedDate.getDate() === day && styles.selectedPickerOptionText]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  dateSection: {
    paddingVertical: 20,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  selectedDateDisplay: {
    fontSize: 16,
    color: '#667eea',
    textAlign: 'center',
    marginTop: 20,
    fontWeight: '600',
    padding: 16,
    backgroundColor: '#f0f4ff',
    borderRadius: 12,
  },
  customPickersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  customPickerButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    minHeight: 70,
    justifyContent: 'center',
  },
  customPickerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    textAlign: 'center',
    numberOfLines: 1,
  },
  customPickerLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '80%',
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  pickerScrollView: {
    maxHeight: 300,
  },
  pickerOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedPickerOption: {
    backgroundColor: '#667eea',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
  selectedPickerOptionText: {
    color: '#fff',
    fontWeight: '600',
  },
  chevronIcon: {
    marginLeft: 'auto',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  saveButton: {
    marginBottom: 16,
  },
  saveButtonGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  spacer: {
    height: 20,
  },

});