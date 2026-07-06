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
  /** 'single' (default) picks one date; 'range' picks a start + end date. */
  mode?: 'single' | 'range';
  // Single-date mode:
  value?: Date;
  onChange?: (value: Date) => void;
  // Range mode:
  startDate?: Date | null;
  endDate?: Date | null;
  onChangeRange?: (start: Date, end: Date) => void;
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

function formatRange(start: Date | null, end: Date | null) {
  if (!start) return 'Select date range';
  if (!end || isSameDay(start, end)) return formatDate(start);
  if (start.getFullYear() === end.getFullYear()) {
    return `${MONTHS_SHORT[start.getMonth()]} ${start.getDate()} – ${MONTHS_SHORT[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** A self-contained month calendar in a bottom sheet (no native deps). */
export function AppCalendarSheet({
  mode = 'single',
  value,
  onChange,
  startDate,
  endDate,
  onChangeRange,
  title,
  chevronColor = Colors.primary,
  triggerStyle,
  triggerContentStyle,
  triggerTextStyle,
}: AppCalendarSheetProps) {
  const isRange = mode === 'range';
  const anchor = useMemo(
    () => (isRange ? startDate ?? new Date() : value ?? new Date()),
    [isRange, startDate, value],
  );

  const [sheetVisible, setSheetVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  // Range mode keeps a draft selection until "Apply".
  const [tempStart, setTempStart] = useState<Date | null>(startDate ?? null);
  const [tempEnd, setTempEnd] = useState<Date | null>(endDate ?? null);
  // The month currently displayed in the grid (first of that month).
  const [viewMonth, setViewMonth] = useState(
    () => new Date(anchor.getFullYear(), anchor.getMonth(), 1),
  );
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    if (sheetVisible) {
      setViewMonth(new Date(anchor.getFullYear(), anchor.getMonth(), 1));
      if (isRange) {
        setTempStart(startDate ?? null);
        setTempEnd(endDate ?? null);
      }
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
  }, [backdropOpacity, sheetVisible, anchor, isRange, startDate, endDate]);

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
    const picked = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);

    if (!isRange) {
      onChange?.(picked);
      closeSheet();
      return;
    }

    // Range: first tap sets the start (and clears end); the next tap sets the
    // end. Tapping a day before the start restarts the range from that day.
    if (!tempStart || tempEnd) {
      setTempStart(picked);
      setTempEnd(null);
    } else if (picked < tempStart) {
      setTempStart(picked);
      setTempEnd(null);
    } else {
      setTempEnd(picked);
    }
  };

  const applyRange = () => {
    if (!tempStart) return;
    onChangeRange?.(startOfDay(tempStart), startOfDay(tempEnd ?? tempStart));
    closeSheet();
  };

  const resolvedTitle = title ?? (isRange ? 'Select Date Range' : 'Select Date');
  const triggerLabel = isRange
    ? formatRange(startDate ?? null, endDate ?? null)
    : formatDate(value ?? new Date());

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
        <Text style={[styles.triggerText, triggerTextStyle]}>{triggerLabel}</Text>
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
            <Text style={styles.sheetTitle}>{resolvedTitle}</Text>

            {isRange && (
              <View style={styles.rangeSummaryRow}>
                <View style={styles.rangeSummaryBox}>
                  <Text style={styles.rangeSummaryLabel}>Start</Text>
                  <Text
                    style={[
                      styles.rangeSummaryValue,
                      !tempStart && styles.rangeSummaryPlaceholder,
                    ]}
                  >
                    {tempStart ? formatDate(tempStart) : 'Select'}
                  </Text>
                </View>
                <Ionicons
                  name="arrow-forward"
                  size={16}
                  color={Colors.textMuted}
                />
                <View style={styles.rangeSummaryBox}>
                  <Text style={styles.rangeSummaryLabel}>End</Text>
                  <Text
                    style={[
                      styles.rangeSummaryValue,
                      !tempEnd && styles.rangeSummaryPlaceholder,
                    ]}
                  >
                    {tempEnd ? formatDate(tempEnd) : 'Select'}
                  </Text>
                </View>
              </View>
            )}

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
                const isToday = isSameDay(cellDate, today);

                let selected = false;
                let isRangeEdge = false;
                let inRange = false;
                if (isRange) {
                  const s = tempStart;
                  const e = tempEnd;
                  const isStart = s ? isSameDay(cellDate, s) : false;
                  const isEnd = e ? isSameDay(cellDate, e) : false;
                  isRangeEdge = isStart || isEnd;
                  selected = isRangeEdge;
                  inRange = Boolean(
                    s && e && cellDate > startOfDay(s) && cellDate < startOfDay(e),
                  );
                } else {
                  selected = value ? isSameDay(cellDate, value) : false;
                }

                return (
                  <Pressable
                    key={`day-${day}`}
                    onPress={() => handleSelectDay(day)}
                    style={[styles.dayCell, inRange && styles.dayCellInRange]}
                  >
                    <View
                      style={[
                        styles.dayInner,
                        isToday && !selected && styles.dayToday,
                        inRange && styles.dayInRange,
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

            {isRange ? (
              <Pressable
                onPress={applyRange}
                disabled={!tempStart}
                style={({ pressed }) => [
                  styles.applyButton,
                  !tempStart && styles.applyButtonDisabled,
                  pressed && tempStart && styles.pressed,
                ]}
              >
                <Text style={styles.applyButtonText}>
                  {tempStart && !tempEnd ? 'Apply single day' : 'Apply range'}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => {
                  onChange?.(new Date());
                  closeSheet();
                }}
                style={({ pressed }) => [styles.todayButton, pressed && styles.pressed]}
              >
                <Text style={styles.todayButtonText}>Today</Text>
              </Pressable>
            )}

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
  rangeSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  rangeSummaryBox: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  rangeSummaryLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  rangeSummaryValue: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  rangeSummaryPlaceholder: {
    color: Colors.textMuted,
    fontWeight: '600',
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
  dayCellInRange: {
    backgroundColor: '#EFF6FF',
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
  dayInRange: {
    backgroundColor: '#EFF6FF',
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
  applyButton: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  applyButtonDisabled: {
    opacity: 0.5,
  },
  applyButtonText: {
    color: Colors.textOnDark,
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
