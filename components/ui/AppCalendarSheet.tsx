import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

interface AppCalendarSheetProps {
  value: Date;
  onChange: (value: Date) => void;
  title?: string;
  chevronColor?: string;
  triggerStyle?: StyleProp<ViewStyle>;
  triggerContentStyle?: StyleProp<ViewStyle>;
  triggerTextStyle?: StyleProp<TextStyle>;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatDate(date: Date) {
  return `${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** A self-contained month calendar in a bottom sheet (no native deps). */
export function AppCalendarSheet({
  value,
  onChange,
  title = 'Select Date',
  chevronColor = Colors.primary,
  triggerStyle,
  triggerContentStyle,
  triggerTextStyle,
}: AppCalendarSheetProps) {
  const [sheetVisible, setSheetVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  // The month currently displayed in the grid (first of that month).
  const [viewMonth, setViewMonth] = useState(
    () => new Date(value.getFullYear(), value.getMonth(), 1),
  );
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (sheetVisible) {
      setViewMonth(new Date(value.getFullYear(), value.getMonth(), 1));
      setModalVisible(true);
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(backdropOpacity, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setModalVisible(false);
      }
    });
  }, [backdropOpacity, sheetVisible, value]);

  const closeSheet = () => setSheetVisible(false);

  const cells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const result: (number | null)[] = [];
    for (let i = 0; i < firstWeekday; i += 1) result.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) result.push(day);
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [viewMonth]);

  const goToMonth = (delta: number) => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  const handleSelectDay = (day: number) => {
    onChange(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day));
    closeSheet();
  };

  return (
    <>
      <Pressable
        onPress={() => setSheetVisible(true)}
        style={({ pressed }) => [
          styles.trigger,
          triggerStyle,
          triggerContentStyle,
          pressed && styles.triggerPressed,
        ]}
      >
        <Ionicons name="calendar-outline" size={18} color={chevronColor} />
        <Text style={[styles.triggerText, triggerTextStyle]}>{formatDate(value)}</Text>
        <Ionicons name="chevron-down" size={18} color={chevronColor} />
      </Pressable>

      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={closeSheet}
      >
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={styles.backdropDismiss} onPress={closeSheet} />

          <View style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.sheetTitle}>{title}</Text>

            <View style={styles.calendarBody}>
            <View style={styles.monthNav}>
              <Pressable
                onPress={() => goToMonth(-1)}
                style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
              >
                <Ionicons name="chevron-back" size={22} color={Colors.primary} />
              </Pressable>
              <Text style={styles.monthLabel}>
                {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
              </Text>
              <Pressable
                onPress={() => goToMonth(1)}
                style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}
              >
                <Ionicons name="chevron-forward" size={22} color={Colors.primary} />
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((weekday) => (
                <View key={weekday} style={styles.weekCell}>
                  <Text style={styles.weekText}>{weekday}</Text>
                </View>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((day, index) => {
                if (day === null) {
                  return <View key={`blank-${index}`} style={styles.dayCell} />;
                }
                const cellDate = new Date(
                  viewMonth.getFullYear(),
                  viewMonth.getMonth(),
                  day,
                );
                const selected = isSameDay(cellDate, value);
                const isToday = isSameDay(cellDate, today);

                return (
                  <Pressable
                    key={`day-${day}`}
                    onPress={() => handleSelectDay(day)}
                    style={styles.dayCell}
                  >
                    <View
                      style={[
                        styles.dayInner,
                        isToday && !selected && styles.dayToday,
                        selected && styles.daySelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          selected && styles.dayTextSelected,
                        ]}
                      >
                        {day}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={() => {
                onChange(new Date());
                closeSheet();
              }}
              style={({ pressed }) => [styles.todayButton, pressed && styles.pressed]}
            >
              <Text style={styles.todayButtonText}>Today</Text>
            </Pressable>

            <Pressable
              onPress={closeSheet}
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            </View>
          </View>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  triggerPressed: {
    opacity: 0.8,
  },
  triggerText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
  },
  backdropDismiss: {
    flex: 1,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  calendarBody: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  handle: {
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  monthLabel: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  weekCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
  },
  weekText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  dayInner: {
    width: 38,
    height: 38,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayToday: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  daySelected: {
    backgroundColor: Colors.primary,
  },
  dayText: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  dayTextSelected: {
    color: Colors.textOnDark,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.7,
  },
  todayButton: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  todayButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  cancelButton: {
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  cancelText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
});
