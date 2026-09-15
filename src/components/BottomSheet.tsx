import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { colors, radius, spacing } from '../theme';

const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 0.8;

/**
 * A sheet that slides up over a scrim. The scrim appears and disappears
 * instantly; only the sheet animates. Tapping the scrim, the hardware back
 * button, or dragging the header down dismisses it. `tall` sheets take most of
 * the screen (item details); otherwise the sheet hugs its content.
 */
export function BottomSheet({
  visible,
  onDismiss,
  header,
  children,
  tall = false,
  grabber = false,
}: {
  visible: boolean;
  onDismiss: () => void;
  /** Rendered above the body; this is the drag handle for swipe-to-dismiss. */
  header?: ReactNode;
  children: ReactNode;
  tall?: boolean;
  grabber?: boolean;
}) {
  const { height } = useWindowDimensions();
  // Lazy state initializers give one stable instance per mount without
  // reading a ref during render.
  const [translateY] = useState(() => new Animated.Value(height));
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  const dismiss = () => {
    Animated.timing(translateY, {
      toValue: height,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onDismissRef.current());
  };

  // eslint-disable-next-line react-hooks/refs -- the handlers read onDismissRef only when a gesture fires, never during render
  const [pan] = useState(() =>
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > DISMISS_DISTANCE || g.vy > DISMISS_VELOCITY) {
          dismiss();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  );

  // Slide the sheet in from the bottom each time it is shown.
  useEffect(() => {
    if (!visible) return;
    translateY.setValue(height);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [visible, height, translateY]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismiss}
    >
      <View style={styles.root}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          onPress={dismiss}
          style={styles.scrim}
        />
        <Animated.View
          style={[
            styles.sheet,
            tall ? styles.tall : styles.hug,
            { transform: [{ translateY }] },
          ]}
        >
          <View {...pan.panHandlers}>
            {grabber ? <View style={styles.grabber} /> : null}
            {header}
          </View>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.scrim,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    overflow: 'hidden',
    paddingBottom: spacing.xl,
  },
  tall: { height: '90%' },
  hug: { maxHeight: '90%' },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.text,
    marginTop: spacing.md,
  },
});
