import React, { useState, useEffect, useCallback } from 'react';
import {
  LogEntry,
  MonsterState,
  MovementCard,
  PlayerState,
  Position,
  TurnPhase,
  UpgradeCard,
} from './types';
import {
  CHEST_COUNT_ON_BOARD,
  CHEST_SENSE_WEAPON_CHANCE,
  DEFAULT_CHEST_WEAPON_CHANCE,
  INITIAL_WEAPON_COUNT,
  MONSTER_FIXED_POSITION,
  MONSTER_HIT_DAMAGE,
  MONSTER_MAX_HP,
  PLAYER_MAX_HP,
  PLAYER_START_POSITION,
  STUN_THRESHOLD,
  UPWIND_COUNT_ON_BOARD,
  UPWIND_MOVEMENT_BONUS,
  WEAPON_BASE_DAMAGE,
} from './constants';
import {
  drawWeightedMovementValue,
  generateInitialChests,
  getReachableCells,
  spawnReplacementChest,
} from './utils/boardUtils';
import { drawRandomUpgrades } from './utils/upgradeUtils';

import { BossPortrait } from './components/BossPortrait';
import { HeartRow } from './components/HeartRow';
import { WeaponIndicator } from './components/WeaponIndicator';
import { Board } from './components/Board';
import { CardHand } from './components/CardHand';
import { CombatLog } from './components/CombatLog';
import { UpgradeCardModal } from './components/UpgradeCardModal';
import { GameOverScreen } from './components/GameOverScreen';
import { VictoryScreen } from './components/VictoryScreen';
import { Shield, RotateCcw, Play, Zap } from 'lucide-react';

export default function App() {
  // Game State
  const [turnNumber, setTurnNumber] = useState<number>(1);
  const [phase, setPhase] = useState<TurnPhase>('DEAL_CARDS');
  const [isBonusTurn, setIsBonusTurn] = useState<boolean>(false);

  // Units State
  const [player, setPlayer] = useState<PlayerState>({
    position: PLAYER_START_POSITION,
    hp: PLAYER_MAX_HP,
    maxHp: PLAYER_MAX_HP,
    weaponCount: INITIAL_WEAPON_COUNT,
    weaponBaseDamage: WEAPON_BASE_DAMAGE,
    steadyStepsBonus: 0,
    marchingOrdersMin: 1,
    chestSenseActive: false,
    armoryContractActive: false,
    twinDrawActive: false,
    secondWindAvailable: false,
    hasSecondWindTriggered: false,
    upwindBonusExtra: 0,
    upwindCountExtra: 0,
    carryOverActive: false,
    carriedPoints: 0,
    activeUpgrades: [],
  });

  const [monster, setMonster] = useState<MonsterState>({
    position: MONSTER_FIXED_POSITION,
    hp: MONSTER_MAX_HP,
    maxHp: MONSTER_MAX_HP,
    isStunned: false,
  });

  // Board State
  const [chests, setChests] = useState<Position[]>([]);
  const [upwinds, setUpwinds] = useState<Position[]>([]);

  // Movement Cards
  const [cards, setCards] = useState<MovementCard[]>([]);
  const [selectedCardsCount, setSelectedCardsCount] = useState<number>(0);
  const [movementPoints, setMovementPoints] = useState<number>(0);

  // Upgrades and Logs
  const [upgradeOptions, setUpgradeOptions] = useState<UpgradeCard[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Helper to add log entries
  const addLog = useCallback(
    (
      text: string,
      type: LogEntry['type'] = 'info',
      overrideTurn?: number
    ) => {
      const newEntry: LogEntry = {
        id: Math.random().toString(36).substring(2, 9),
        turnNumber: overrideTurn ?? turnNumber,
        text,
        type,
        timestamp: new Date().toLocaleTimeString(),
      };
      setLogs((prev) => [...prev, newEntry]);
    },
    [turnNumber]
  );

  // Initialize Game Run
  const resetGame = useCallback(() => {
    const initialChests = generateInitialChests(
      CHEST_COUNT_ON_BOARD,
      PLAYER_START_POSITION,
      MONSTER_FIXED_POSITION
    );
    // Upwinds are placed like chests but must avoid the chest cells.
    const initialUpwinds = generateInitialChests(
      UPWIND_COUNT_ON_BOARD,
      PLAYER_START_POSITION,
      MONSTER_FIXED_POSITION,
      initialChests
    );

    setTurnNumber(1);
    setPhase('DEAL_CARDS');
    setIsBonusTurn(false);

    const initialPlayer: PlayerState = {
      position: PLAYER_START_POSITION,
      hp: PLAYER_MAX_HP,
      maxHp: PLAYER_MAX_HP,
      weaponCount: INITIAL_WEAPON_COUNT,
      weaponBaseDamage: WEAPON_BASE_DAMAGE,
      steadyStepsBonus: 0,
      marchingOrdersMin: 1,
      chestSenseActive: false,
      armoryContractActive: false,
      twinDrawActive: false,
      secondWindAvailable: false,
      hasSecondWindTriggered: false,
      upwindBonusExtra: 0,
      upwindCountExtra: 0,
      carryOverActive: false,
      carriedPoints: 0,
      activeUpgrades: [],
    };

    setPlayer(initialPlayer);
    setMonster({
      position: MONSTER_FIXED_POSITION,
      hp: MONSTER_MAX_HP,
      maxHp: MONSTER_MAX_HP,
      isStunned: false,
    });
    setChests(initialChests);
    setUpwinds(initialUpwinds);
    setCards([]);
    setSelectedCardsCount(0);
    setMovementPoints(0);
    setUpgradeOptions([]);
    setLogs([]);

    // Deal turn 1 cards
    startNewTurn(1, initialPlayer, false);
  }, []);

  // Deal movement cards for the turn
  const startNewTurn = useCallback(
    (turnNum: number, currPlayer: PlayerState, isBonus: boolean) => {
      // Trigger Armory Contract passive if active
      let updatedPlayer = { ...currPlayer };
      if (currPlayer.armoryContractActive && !isBonus) {
        updatedPlayer.weaponCount += 1;
        setPlayer(updatedPlayer);
        addLog('Armory Contract granted +1 weapon for this turn!', 'chest', turnNum);
      }

      // Generate 3 movement cards
      const newCards: MovementCard[] = Array.from({ length: 3 }).map((_, i) => {
        const base = drawWeightedMovementValue(0, updatedPlayer.marchingOrdersMin);
        const mod = base + updatedPlayer.steadyStepsBonus;
        return {
          id: `card_${turnNum}_${i}_${Math.random().toString(36).substring(2, 5)}`,
          baseValue: base,
          modifiedValue: mod,
          isRevealed: false,
          isSelected: false,
        };
      });

      setCards(newCards);
      setSelectedCardsCount(0);
      setMovementPoints(0);
      setPhase('REVEAL_CARDS');

      if (!isBonus) {
        addLog(`Turn #${turnNum} started. 3 movement cards dealt face-down.`, 'info', turnNum);
      }
    },
    [addLog]
  );

  // On initial mount, start run
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Reveal Card Click Handler
  const handleRevealCard = (cardId: string) => {
    if (phase !== 'REVEAL_CARDS') return;

    const targetCard = cards.find((c) => c.id === cardId);
    if (!targetCard || targetCard.isRevealed) return;

    const maxToReveal = player.twinDrawActive ? 2 : 1;
    const newSelectedCount = selectedCardsCount + 1;

    // Reveal card
    const updatedCards = cards.map((c) =>
      c.id === cardId ? { ...c, isRevealed: true, isSelected: true } : c
    );

    let newMovementPoints = movementPoints + targetCard.modifiedValue;

    setCards(updatedCards);
    setSelectedCardsCount(newSelectedCount);

    addLog(
      `Revealed card value: +${targetCard.modifiedValue} movement points!`,
      'info'
    );

    // If reached max card draws, transition to PLAYER_MOVE
    if (newSelectedCount >= maxToReveal) {
      // Fold in any points carried over from last turn (Windward Reserves)
      if (player.carriedPoints > 0) {
        newMovementPoints += player.carriedPoints;
        addLog(
          `💨 Windward Reserves banked +${player.carriedPoints} movement points from last turn!`,
          'info'
        );
        setPlayer((prev) => ({ ...prev, carriedPoints: 0 }));
      }

      setPhase('PLAYER_MOVE');
      addLog(
        `Movement phase active! Total points: ${newMovementPoints}. Pick ONE destination cell (or your own tile to stay).`,
        'info'
      );
    }

    setMovementPoints(newMovementPoints);
  };

  // End-of-turn combat: player strikes first, then the monster counterattacks.
  // Returns the resolved units and whether the run ended (victory/defeat).
  const resolveCombat = (
    currPlayer: PlayerState,
    currMonster: MonsterState
  ): { ended: boolean; player: PlayerState; monster: MonsterState } => {
    setPhase('COMBAT_RESOLUTION');
    addLog('⚔️ End of turn — you clash with the Scribble Monster!', 'combat');

    let updatedMonster = { ...currMonster };
    let updatedPlayer = { ...currPlayer };

    // 1. Player Attacks First (if armed)
    if (updatedPlayer.weaponCount === 0) {
      addLog(
        '⚠️ No weapons equipped! Unable to strike the monster this turn.',
        'warning'
      );
    } else {
      const damage = updatedPlayer.weaponCount * updatedPlayer.weaponBaseDamage;
      updatedMonster.hp = Math.max(0, updatedMonster.hp - damage);

      addLog(
        `💥 Player struck monster for ${damage} damage! (Monster HP: ${updatedMonster.hp}/${updatedMonster.maxHp})`,
        'combat'
      );

      // Check Stun Threshold
      if (damage >= STUN_THRESHOLD) {
        updatedMonster.isStunned = true;
        addLog(
          '⚡ STUNNING HIT! Struck for >= 3 damage! Monster is stunned and skips its counterattack!',
          'combat'
        );
      }

      // Check Monster Defeat (Victory)
      if (updatedMonster.hp <= 0) {
        setMonster(updatedMonster);
        setPlayer(updatedPlayer);
        setPhase('VICTORY');
        addLog('🎉 VICTORY! You vanquished the Scribble Monster!', 'victory');
        return { ended: true, player: updatedPlayer, monster: updatedMonster };
      }
    }

    // 2. Monster Counterattack (if alive)
    if (updatedMonster.isStunned) {
      addLog('Monster is stunned and skips its counterattack!', 'info');
    } else {
      const newPlayerHp = updatedPlayer.hp - MONSTER_HIT_DAMAGE;

      if (newPlayerHp <= 0) {
        // Second Wind Check
        if (updatedPlayer.secondWindAvailable) {
          updatedPlayer.hp = 1;
          updatedPlayer.secondWindAvailable = false;
          updatedPlayer.hasSecondWindTriggered = true;
          addLog(
            '💨 SECOND WIND TRIGGERED! Survived a fatal strike at 1 HP!',
            'combat'
          );
        } else {
          updatedPlayer.hp = 0;
          setPlayer(updatedPlayer);
          setMonster({ ...updatedMonster, isStunned: false });
          setPhase('GAME_OVER');
          addLog('💀 GAME OVER! Player fell in battle.', 'defeat');
          return { ended: true, player: updatedPlayer, monster: updatedMonster };
        }
      } else {
        updatedPlayer.hp = newPlayerHp;
        addLog(
          `Monster counterattacked! Player lost 1 HP (Hearts: ${newPlayerHp}/${updatedPlayer.maxHp})`,
          'combat'
        );
      }
    }

    // Reset stun at end of turn
    updatedMonster.isStunned = false;
    setMonster(updatedMonster);
    setPlayer(updatedPlayer);
    return { ended: false, player: updatedPlayer, monster: updatedMonster };
  };

  // End of turn: resolve combat, then either deal a bonus hand or offer upgrades.
  const endOfTurn = (
    currPlayer: PlayerState,
    currMonster: MonsterState,
    bonusPending: boolean
  ) => {
    const result = resolveCombat(currPlayer, currMonster);
    if (result.ended) return;

    if (bonusPending) {
      addLog('Extra turn! A fresh hand is dealt.', 'info');
      setIsBonusTurn(false);
      startNewTurn(turnNumber, result.player, true);
    } else {
      // Draw 3 upgrades
      const options = drawRandomUpgrades(3, result.player.activeUpgrades);
      setUpgradeOptions(options);
      setPhase('UPGRADE_SELECTION');
      addLog('Turn finished. Pick 1 Upgrade Card!', 'upgrade');
    }
  };

  // Board Cell Click Handler (Movement) — single destination per turn.
  const handleCellClick = (targetPos: Position, path?: Position[]) => {
    if (phase !== 'PLAYER_MOVE') return;

    // The monster's cell is never a valid landing spot.
    if (
      targetPos.row === monster.position.row &&
      targetPos.col === monster.position.col
    ) {
      return;
    }

    const isStay =
      targetPos.row === player.position.row &&
      targetPos.col === player.position.col;

    // Determine cost (0 to hold position, otherwise tiles travelled)
    const cost = isStay ? 0 : path ? path.length - 1 : 1;
    if (cost < 0 || cost > movementPoints) return;
    if (!isStay && cost <= 0) return;

    const remainingPoints = movementPoints - cost;

    // Move the pawn
    let updatedPlayer: PlayerState = { ...player, position: targetPos };

    if (isStay) {
      addLog('Held position — ending the turn.', 'info');
    } else {
      addLog(
        `Moved to row ${targetPos.row + 1}, col ${targetPos.col + 1} (-${cost} move pts).`,
        'info'
      );
    }

    // 1. Upwind? Refund points and let the player pick another destination.
    const upwindIndex = upwinds.findIndex(
      (u) => u.row === targetPos.row && u.col === targetPos.col
    );

    if (upwindIndex !== -1) {
      const remainingUpwinds = upwinds.filter((_, i) => i !== upwindIndex);
      const replacement = spawnReplacementChest(
        remainingUpwinds,
        updatedPlayer.position,
        monster.position,
        chests
      );
      const nextUpwinds = replacement
        ? [...remainingUpwinds, replacement]
        : remainingUpwinds;
      setUpwinds(nextUpwinds);

      const bonus = UPWIND_MOVEMENT_BONUS + updatedPlayer.upwindBonusExtra;
      const nextPoints = remainingPoints + bonus;
      setPlayer(updatedPlayer);
      setMovementPoints(nextPoints);
      addLog(
        `🌀 Caught an upwind! +${bonus} movement points — pick another destination. (Points: ${nextPoints})`,
        'chest'
      );
      return; // stay in PLAYER_MOVE for another hop
    }

    // 2. Chest? Grant its reward, then the turn's movement ends.
    const chestIndex = chests.findIndex(
      (c) => c.row === targetPos.row && c.col === targetPos.col
    );
    let isExtraTurnReward = false;

    if (chestIndex !== -1) {
      const remainingChests = chests.filter((_, i) => i !== chestIndex);
      const replacement = spawnReplacementChest(
        remainingChests,
        updatedPlayer.position,
        monster.position,
        upwinds
      );
      const nextChests = replacement
        ? [...remainingChests, replacement]
        : remainingChests;
      setChests(nextChests);

      const weaponChance = updatedPlayer.chestSenseActive
        ? CHEST_SENSE_WEAPON_CHANCE
        : DEFAULT_CHEST_WEAPON_CHANCE;

      if (Math.random() < weaponChance) {
        updatedPlayer = {
          ...updatedPlayer,
          weaponCount: updatedPlayer.weaponCount + 1,
        };
        addLog(
          `🎁 Chest opened! Found a Weapon! Total weapons: ${updatedPlayer.weaponCount}`,
          'chest'
        );
      } else {
        isExtraTurnReward = true;
        addLog(
          '🎁 Chest opened! Found an EXTRA TURN! A fresh hand follows this turn.',
          'chest'
        );
      }
    }

    // Movement ends. Bank leftover points if Windward Reserves is active.
    if (updatedPlayer.carryOverActive && remainingPoints > 0) {
      updatedPlayer = { ...updatedPlayer, carriedPoints: remainingPoints };
      addLog(
        `💨 Windward Reserves: ${remainingPoints} leftover point(s) banked for next turn.`,
        'info'
      );
    }

    setPlayer(updatedPlayer);
    setMovementPoints(0);

    if (isExtraTurnReward) {
      setIsBonusTurn(true);
    }

    endOfTurn(updatedPlayer, monster, isExtraTurnReward);
  };

  // Select Upgrade Handler
  const handleSelectUpgrade = (upgrade: UpgradeCard) => {
    let updatedPlayer = { ...player };

    // Apply upgrade effect
    switch (upgrade.effectType) {
      case 'steady_steps':
        updatedPlayer.steadyStepsBonus += 1;
        break;
      case 'whetstone':
        updatedPlayer.weaponBaseDamage += 1;
        break;
      case 'chest_sense':
        updatedPlayer.chestSenseActive = true;
        break;
      case 'armory_contract':
        updatedPlayer.armoryContractActive = true;
        break;
      case 'marching_orders':
        updatedPlayer.marchingOrdersMin = 3;
        break;
      case 'warlords_momentum':
        updatedPlayer.armoryContractActive = true;
        updatedPlayer.marchingOrdersMin = 3;
        break;
      case 'twin_draw':
        updatedPlayer.twinDrawActive = true;
        break;
      case 'second_wind':
        updatedPlayer.secondWindAvailable = true;
        break;
      case 'upwind_gust':
        updatedPlayer.upwindBonusExtra += 1;
        break;
      case 'upwind_gale': {
        updatedPlayer.upwindCountExtra += 1;
        // Immediately raise the active upwind count by spawning one more.
        const newUpwind = spawnReplacementChest(
          upwinds,
          updatedPlayer.position,
          monster.position,
          chests
        );
        if (newUpwind) {
          setUpwinds((prev) => [...prev, newUpwind]);
        }
        break;
      }
      case 'upwind_reserves':
        updatedPlayer.carryOverActive = true;
        break;
    }

    updatedPlayer.activeUpgrades = [
      ...updatedPlayer.activeUpgrades,
      upgrade.name,
    ];
    setPlayer(updatedPlayer);

    addLog(`Claimed Upgrade: ${upgrade.name}!`, 'upgrade');

    // Advance turn
    const nextTurn = turnNumber + 1;
    setTurnNumber(nextTurn);
    startNewTurn(nextTurn, updatedPlayer, false);
  };

  // Calculate reachable cells for board highlighting
  const reachableCells =
    phase === 'PLAYER_MOVE' && movementPoints > 0
      ? getReachableCells(player.position, movementPoints)
      : [];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] flex flex-col items-center p-2 sm:p-4 select-none font-serif-warm">
      {/* Header Title */}
      <header className="text-center mb-2">
        <h1 className="font-serif-warm text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A]">
          ANTUNOSIA
        </h1>
      </header>

      {/* Main Container Layout */}
      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* Boss Portrait (Pinned top) */}
        <BossPortrait monster={monster} />

        {/* Stats Bar: Player Hearts & Weapon Indicator */}
        <div className="flex items-center justify-center gap-4 my-1.5 bg-[#F5F1E9] px-4 py-1.5 border-2 border-black shadow-solid-sm">
          <HeartRow currentHp={player.hp} maxHp={player.maxHp} />
          <div className="h-6 w-0.5 bg-black opacity-30" />
          <WeaponIndicator
            weaponCount={player.weaponCount}
            weaponBaseDamage={player.weaponBaseDamage}
          />
        </div>

        {/* Board & Card Hand */}
        <div className="flex flex-col items-center w-full">
          {/* 6x6 Game Board */}
          <Board
            playerPos={player.position}
            monsterPos={monster.position}
            chests={chests}
            upwinds={upwinds}
            phase={phase}
            movementPoints={movementPoints}
            reachableCells={reachableCells}
            onCellClick={handleCellClick}
          />

          {/* Card Hand */}
          <CardHand
            cards={cards}
            twinDrawActive={player.twinDrawActive}
            selectedCount={selectedCardsCount}
            onRevealCard={handleRevealCard}
            isMovePhase={phase === 'PLAYER_MOVE'}
            movementPointsLeft={movementPoints}
          />
        </div>

        {/* Combat & Adventure Event Feed */}
        <div className="w-full max-w-md">
          <CombatLog logs={logs} />
        </div>
      </div>

      {/* Upgrade Modal */}
      {phase === 'UPGRADE_SELECTION' && (
        <UpgradeCardModal
          options={upgradeOptions}
          onSelectUpgrade={handleSelectUpgrade}
        />
      )}

      {/* Game Over Overlay */}
      {phase === 'GAME_OVER' && (
        <GameOverScreen
          turnNumber={turnNumber}
          player={player}
          onRestart={resetGame}
        />
      )}

      {/* Victory Overlay */}
      {phase === 'VICTORY' && (
        <VictoryScreen
          turnNumber={turnNumber}
          player={player}
          onRestart={resetGame}
        />
      )}

      {/* Restart Run Button Footer */}
      <footer className="mt-2 mb-4 text-center">
        <button
          onClick={resetGame}
          className="px-4 py-1.5 text-xs font-serif-warm font-bold text-[#1A1A1A] bg-[#F5F1E9] border-2 border-black shadow-solid-sm hover:bg-[#EFE8DC] transition-colors flex items-center gap-1.5 mx-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restart New Run
        </button>
      </footer>
    </div>
  );
}
