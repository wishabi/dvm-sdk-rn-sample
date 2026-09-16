import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import { BottomSheet } from './BottomSheet';
import { FieldLabel } from './FieldLabel';
import { Icon } from './Icon';
import { RadioList, type RadioOption } from './RadioList';

/**
 * A form field that opens a Cancel / Confirm picker sheet with radio options.
 * The choice is only committed on Confirm.
 */
export function PickerField<T extends string>({
  label,
  title = label,
  placeholder,
  options,
  selected,
  onSelect,
}: {
  label: string;
  /** Sheet heading; defaults to the field label. */
  title?: string;
  placeholder: string;
  options: readonly RadioOption<T>[];
  selected: T | null;
  onSelect: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<T | null>(selected);
  const selectedLabel = options.find((o) => o.value === selected)?.label;

  const openSheet = () => {
    setPending(selected);
    setOpen(true);
  };
  const confirm = () => {
    if (pending !== null) onSelect(pending);
    setOpen(false);
  };

  return (
    <View>
      <FieldLabel>{label}</FieldLabel>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityValue={{ text: selectedLabel ?? placeholder }}
        onPress={openSheet}
        style={styles.trigger}
      >
        <Text
          numberOfLines={1}
          style={[styles.value, !selectedLabel && styles.placeholder]}
        >
          {selectedLabel ?? placeholder}
        </Text>
        <Icon name="chevron" size={20} />
      </Pressable>

      <BottomSheet
        visible={open}
        onDismiss={() => setOpen(false)}
        header={
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              onPress={() => setOpen(false)}
              hitSlop={8}
              style={styles.headerButton}
            >
              <Text style={styles.headerAction}>Cancel</Text>
            </Pressable>
            <Text style={styles.title}>{title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Confirm"
              accessibilityState={{ disabled: pending === null }}
              disabled={pending === null}
              onPress={confirm}
              hitSlop={8}
              style={[styles.headerButton, styles.headerButtonEnd]}
            >
              <Text style={[styles.headerAction, styles.confirm]}>Confirm</Text>
            </Pressable>
          </View>
        }
      >
        <RadioList options={options} selected={pending} onSelect={setPending} />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
  },
  value: { flex: 1, fontSize: 16, color: colors.text },
  placeholder: { color: colors.placeholder },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerButton: { minWidth: 72, minHeight: 44, justifyContent: 'center' },
  headerButtonEnd: { alignItems: 'flex-end' },
  headerAction: { fontSize: 16, color: colors.primary },
  confirm: { fontWeight: '600' },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
});
