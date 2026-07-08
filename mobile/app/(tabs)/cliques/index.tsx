import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Screen } from '@/components/Screen';
import { AppText } from '@/components/AppText';
import { Button } from '@/components/ui';
import { MosaicHero } from '@/components/MosaicHero';
import { Facepile } from '@/components/Facepile';
import type { Clique } from '@/data/clique';
import { CURRENT_USER_ID } from '@/data/users';
import { useAppStore } from '@/store/AppStore';
import { theme } from '@/theme';

export default function CliquesScreen() {
  const { cliques, invites, removeMember, leaveClique, respondInvite } = useAppStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const incomingInvites = invites.filter((i) => i.inviteeId === CURRENT_USER_ID);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.dot} />
            <AppText weight="black" style={styles.wordmark}>
              CLIQUES
            </AppText>
          </View>
          <Pressable onPress={() => router.push('/(tabs)/cliques/new')} style={styles.newBtn} hitSlop={8}>
            <AppText weight="bold" style={styles.newBtnText}>
              + New
            </AppText>
          </Pressable>
        </View>

        {incomingInvites.map((invite) => (
          <View key={invite.id} style={styles.inviteCard}>
            <AppText weight="medium" style={styles.inviteLabel}>
              CLIQUE INVITATION
            </AppText>
            <AppText weight="black" style={styles.inviteName}>
              {invite.cliqueName}
            </AppText>
            <AppText weight="regular" style={styles.inviteSub}>
              {invite.inviterName} invited you
            </AppText>
            <View style={styles.inviteActions}>
              <Button label="Accept" style={{ flex: 1 }} onPress={() => respondInvite(invite.id, true)} />
              <Button label="Decline" variant="dark" style={{ flex: 1 }} onPress={() => respondInvite(invite.id, false)} />
            </View>
          </View>
        ))}

        {cliques.length === 0 && incomingInvites.length === 0 && (
          <AppText weight="regular" style={styles.empty}>
            No cliques yet — start one to find your friends at the festival.
          </AppText>
        )}

        {cliques.map((clique) => (
          <CliqueCard
            key={clique.id}
            clique={clique}
            expanded={expandedId === clique.id}
            onToggle={() => setExpandedId((id) => (id === clique.id ? null : clique.id))}
            onRemoveMember={(userId) => removeMember(clique.id, userId)}
            onLeave={() => {
              leaveClique(clique.id);
              setExpandedId(null);
            }}
          />
        ))}
      </ScrollView>
    </Screen>
  );
}

function CliqueCard({
  clique,
  expanded,
  onToggle,
  onRemoveMember,
  onLeave,
}: {
  clique: Clique;
  expanded: boolean;
  onToggle: () => void;
  onRemoveMember: (userId: string) => void;
  onLeave: () => void;
}) {
  const isCreator = clique.creatorId === CURRENT_USER_ID;
  const memberCount = clique.members.length + 1; // +1 for the current viewer
  const { width } = useWindowDimensions();
  const imageSize = width - 40 - 20; // Screen padding (20*2) + card padding (10*2)

  return (
    <View style={styles.card}>
      <Pressable onPress={onToggle}>
        <MosaicHero heroImage={clique.heroImage} members={clique.members} size={imageSize} />
        <View style={styles.actionRow}>
          <Facepile members={clique.members} />
          <Pressable
            onPress={() => router.push({ pathname: '/(tabs)/cliques/wya', params: { cliqueId: clique.id } })}
            style={styles.wyaBtn}>
            <AppText weight="bold" style={styles.wyaBtnText}>
              wya?
            </AppText>
          </Pressable>
        </View>
        <AppText weight="bold" style={styles.cliqueName}>
          {clique.name} <AppText weight="medium" style={styles.cliqueCount}>· {memberCount} members</AppText>
        </AppText>
      </Pressable>

      {expanded && (
        <View style={styles.expandPanel}>
          <AppText weight="medium" style={styles.membersLabel}>
            MEMBERS
          </AppText>

          {isCreator ? (
            <View style={styles.memberRow}>
              <View style={[styles.memberDot, { backgroundColor: theme.accent }]} />
              <AppText weight="bold" style={styles.memberName}>
                You
              </AppText>
              <AppText weight="medium" style={styles.memberTag}>
                CREATOR
              </AppText>
            </View>
          ) : null}

          {clique.members.map((m) => (
            <View key={m.slug} style={styles.memberRow}>
              <View style={[styles.memberDot, { backgroundColor: m.color }]} />
              <AppText weight="bold" style={styles.memberName}>
                {m.name}
              </AppText>
              {m.slug === clique.creatorId && (
                <AppText weight="medium" style={styles.memberTag}>
                  CREATOR
                </AppText>
              )}
              {isCreator && (
                <Pressable onPress={() => onRemoveMember(m.slug)} style={styles.removeBtn} hitSlop={8}>
                  <SymbolView name={{ ios: 'xmark', android: 'close', web: 'close' }} tintColor={theme.muted} size={9} />
                </Pressable>
              )}
            </View>
          ))}

          {isCreator ? (
            <Pressable
              onPress={() => router.push({ pathname: '/(tabs)/cliques/invite', params: { cliqueId: clique.id } })}
              style={styles.manageBtn}>
              <AppText weight="bold" style={styles.manageBtnText}>
                + Add members
              </AppText>
            </Pressable>
          ) : (
            <Pressable onPress={onLeave} style={styles.leaveBtn}>
              <AppText weight="bold" style={styles.leaveBtnText}>
                Leave Clique
              </AppText>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.accent },
  wordmark: { fontSize: 16, letterSpacing: 0.6 },
  newBtn: { borderWidth: 1, borderColor: theme.accent, borderRadius: 100, paddingVertical: 5, paddingHorizontal: 11 },
  newBtnText: { fontSize: 10.5, color: theme.accent },

  inviteCard: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.accent,
    backgroundColor: theme.magentaSoft,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  inviteLabel: { fontSize: 9, letterSpacing: 0.6, color: theme.accent, marginBottom: 6 },
  inviteName: { fontSize: 15, marginBottom: 3 },
  inviteSub: { fontSize: 11.5, color: theme.muted, marginBottom: 12 },
  inviteActions: { flexDirection: 'row', gap: 8 },

  empty: { fontSize: 12.5, color: theme.muted, textAlign: 'center', marginTop: 40 },

  card: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 18,
    padding: 10,
    marginBottom: 16,
  },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, marginBottom: 6 },
  wyaBtn: { backgroundColor: theme.accent, borderRadius: 100, paddingVertical: 6, paddingHorizontal: 14 },
  wyaBtnText: { fontSize: 11, color: theme.void },
  cliqueName: { fontSize: 13, color: theme.primary },
  cliqueCount: { fontSize: 11, color: theme.muted },

  expandPanel: { borderTopWidth: 1, borderTopColor: theme.border, borderStyle: 'dashed', marginTop: 10, paddingTop: 10 },
  membersLabel: { fontSize: 9, letterSpacing: 0.6, color: theme.mutedDim, marginBottom: 8 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 },
  memberDot: { width: 22, height: 22, borderRadius: 11 },
  memberName: { fontSize: 12, color: theme.primary, flex: 1 },
  memberTag: { fontSize: 8.5, color: theme.mutedDim, letterSpacing: 0.3 },
  removeBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manageBtn: {
    marginTop: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.accent,
    backgroundColor: theme.magentaSoft,
    borderRadius: 10,
    paddingVertical: 10,
  },
  manageBtnText: { fontSize: 11, color: theme.accent },
  leaveBtn: {
    marginTop: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingVertical: 10,
  },
  leaveBtnText: { fontSize: 11, color: theme.muted },
});
