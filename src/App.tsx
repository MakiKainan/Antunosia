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
  WEAPON_BASE_DAMAGE,
} from './constants';
import {
  drawWeightedMovementValue,
  generateInitialChests,
  getReachableCells,
  isAdjacentOrSame,
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

    const newMovementPoints = movementPoints + targetCard.modifiedValue;

    setCards(updatedCards);
    setSelectedCardsCount(newSelectedCount);
    setMovementPoints(newMovementPoints);

    addLog(
      `Revealed card value: +${targetCard.modifiedValue} movement points!`,
      'info'
    );

    // If reached max card draws, transition to PLAYER_MOVE
    if (newSelectedCount >= maxToReveal) {
      setPhase('PLAYER_MOVE');
      addLog(
        `Movement phase active! Total points: ${newMovementPoints}. Click highlighted board cell to step.`,
        'info'
      );
    }
  };

  // Combat Resolution Trigger
  const triggerCombat = (currPlayer: PlayerState, currMonster: MonsterState) => {
    setPhase('COMBAT_RESOLUTION');
    addLog('⚔️ COMBAT TRIGGERED with the Scribble Monster!', 'combat');

    let updatedMonster = { ...currMonster };
    let updatedPlayer = { ...currPlayer };

    // 1. Player Attacks First
    if (updatedPlayer.weaponCount === 0) {
      addLog(
        '⚠️ No weapons equipped! Unable to strike monster this turn.',
        'warning'
      );
    } else {
      const damage = updatedPlayer.weaponCount * updatedPlayer.weaponBaseDamage;
      const newMonsterHp = Math.max(0, updatedMonster.hp - damage);
      updatedMonster.hp = newMonsterHp;

      addLog(
        `💥 Player struck monster for ${damage} damage! (Monster HP: ${newMonsterHp}/${updatedMonster.maxHp})`,
        'combat'
      );

      // Check Stun Threshold
      if (damage >= STUN_THRESHOLD) {
        updatedMonster.isStunned = true;
        addLog(
          '⚡ STUNNING HIT! Struck for >= 3 damage! Monster is stunned and skips counterattack!',
          'combat'
        );
      }

      // Check Monster Defeat (Victory)
      if (newMonsterHp <= 0) {
        setMonster(updatedMonster);
        setPhase('VICTORY');
        addLog('🎉 VICTORY! You vanquished the Scribble Monster!', 'victory');
        return;
      }
    }

    setMonster(updatedMonster);

    // 2. Monster Counterattack (if alive)
    if (updatedMonster.isStunned) {
      addLog('Monster is stunned and skips its counterattack!', 'info');
      // Reset stun at end of turn
      updatedMonster.isStunned = false;
      setMonster(updatedMonster);
    } else {
      // Monster strikes player
      const newPlayerHp = updatedPlayer.hp - MONSTER_HIT_DAMAGE;

      if (newPlayerHp <= 0) {
        // Second Wind Check
        if (updatedPlayer.secondWindAvailable) {
          updatedPlayer.hp = 1;
          updatedPlayer.secondWindAvailable = false;
          updatedPlayer.hasSecondWindTriggered = true;
          setPlayer(updatedPlayer);
          addLog(
            '💨 SECOND WIND TRIGGERED! Survived fatal strike at 1 HP!',
            'combat'
          );
        } else {
          updatedPlayer.hp = 0;
          setPlayer(updatedPlayer);
          setPhase('GAME_OVER');
          addLog('💀 GAME OVER! Player fell in battle.', 'defeat');
          return;
        }
      } else {
        updatedPlayer.hp = newPlayerHp;
        setPlayer(updatedPlayer);
        addLog(
          `Monster counterattacked! Player lost 1 HP (Hearts: ${newPlayerHp}/${updatedPlayer.maxHp})`,
          'combat'
        );
      }
    }

    // After combat completes without game over/victory, proceed to end turn
    finishTurn(updatedPlayer, updatedMonster);
  };

  // Finish turn and present upgrade options (unless bonus turn)
  const finishTurn = (currPlayer: PlayerState, currMonster: MonsterState) => {
    // Reset stun state for monster
    setMonster({ ...currMonster, isStunned: false });

    if (isBonusTurn) {
      addLog('Extra turn completed!', 'info');
      setIsBonusTurn(false);
      const nextTurn = turnNumber + 1;
      setTurnNumber(nextTurn);
      startNewTurn(nextTurn, currPlayer, false);
    } else {
      // Draw 3 upgrades
      const options = drawRandomUpgrades(3, currPlayer.activeUpgrades);
      setUpgradeOptions(options);
      setPhase('UPGRADE_SELECTION');
      addLog('Turn finished. Pick 1 Upgrade Card!', 'upgrade');
    }
  };

  // Board Cell Click Handler (Movement)
  const handleCellClick = (targetPos: Position, path?: Position[]) => {
    if (phase !== 'PLAYER_MOVE') return;

    // Determine cost
    const cost = path ? path.length - 1 : 1;
    if (cost <= 0 || cost > movementPoints) return;

    const remainingPoints = movementPoints - cost;
    setMovementPoints(remainingPoints);
    setPlayer((prev) => ({ ...prev, position: targetPos }));

    addLog(
      `Moved to row ${targetPos.row + 1}, col ${targetPos.col + 1} (-${cost} move pts).`,
      'info'
    );

    // 1. Check if landed on a chest
    const chestIndex = chests.findIndex(
      (c) => c.row === targetPos.row && c.col === targetPos.col
    );

    let currentChests = [...chests];
    let isExtraTurnReward = false;

    if (chestIndex !== -1) {
      // Remove chest
      currentChests.splice(chestIndex, 1);

      // Spawn replacement chest elsewhere
      const newChest = spawnReplacementChest(
        currentChests,
        targetPos,
        monster.position
      );
      if (newChest) {
        currentChests.push(newChest);
      }
      setChests(currentChests);

      // Roll chest reward
      const weaponChance = player.chestSenseActive
        ? CHEST_SENSE_WEAPON_CHANCE
        : DEFAULT_CHEST_WEAPON_CHANCE;

      if (Math.random() < weaponChance) {
        // Weapon reward
        setPlayer((prev) => {
          const updated = { ...prev, weaponCount: prev.weaponCount + 1 };
          addLog(
            `🎁 Chest opened! Found a Weapon! Total weapons: ${updated.weaponCount}`,
            'chest'
          );
          return updated;
        });
      } else {
        // Extra Turn reward
        addLog(
          '🎁 Chest opened! Found an EXTRA TURN! Fresh hand dealt instantly!',
          'chest'
        );
        isExtraTurnReward = true;
      }
    }

    // 2. Check if reached or adjacent to monster cell
    const reachedMonster = isAdjacentOrSame(targetPos, monster.position);

    if (reachedMonster) {
      triggerCombat(player, monster);
      return;
    }

    // 3. Handle Extra Turn reward
    if (isExtraTurnReward) {
      setIsBonusTurn(true);
      startNewTurn(turnNumber, player, true);
      return;
    }

    // 4. Check if movement points exhausted
    if (remainingPoints === 0) {
      addLog('Movement points exhausted.', 'info');
      finishTurn(player, monster);
    }
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
        <h1 className="font-serif-warm text-2xl sm:text-3xl font-bold tracking-tight text-[#1A1A1A] flex items-center justify-center gap-2">
          <span className="text-[#800000]">🗡️</span> SCRIBBLE ROGUELITE <span className="text-[#800000]">🛡️</span>
        </h1>
        <p className="font-serif-warm text-xs text-[#1A1A1A] opacity-80 italic mt-0.5">
          Turn #{turnNumber} • 6x6 Sudoku Grid Board • Draft Cards & Slay the Boss
        </p>
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
