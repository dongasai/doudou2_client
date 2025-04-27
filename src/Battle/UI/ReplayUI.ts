/**
 * 战斗回放UI界面
 * 提供回放控制和显示功能
 */

import { logger } from '../Core/Logger';
import { ReplayState } from '../../DesignConfig/types/BattleReplay';
import { BattleEngine } from '../Core/BattleEngine';

export class ReplayUI {
  // 回放引擎
  private battleEngine: BattleEngine;
  // UI元素
  private container: HTMLElement | null = null;
  private controlsContainer: HTMLElement | null = null;
  private timelineContainer: HTMLElement | null = null;
  private infoContainer: HTMLElement | null = null;
  private eventListContainer: HTMLElement | null = null;
  // 控制按钮
  private playButton: HTMLButtonElement | null = null;
  private pauseButton: HTMLButtonElement | null = null;
  private stopButton: HTMLButtonElement | null = null;
  private speedSelect: HTMLSelectElement | null = null;
  private timeSlider: HTMLInputElement | null = null;
  private timeDisplay: HTMLElement | null = null;
  // 状态
  private isInitialized: boolean = false;
  private updateInterval: number | null = null;

  /**
   * 构造函数
   * @param battleEngine 战斗引擎
   */
  constructor(battleEngine: BattleEngine) {
    this.battleEngine = battleEngine;
  }

  /**
   * 初始化UI
   * @param containerId 容器ID
   */
  public initialize(containerId: string): boolean {
    if (this.isInitialized) {
      return true;
    }

    // 获取容器元素
    this.container = document.getElementById(containerId);
    if (!this.container) {
      logger.error(`找不到容器元素: ${containerId}`);
      return false;
    }

    // 创建UI结构
    this.createUIStructure();

    // 绑定事件
    this.bindEvents();

    // 设置更新间隔
    this.updateInterval = window.setInterval(() => this.updateUI(), 100);

    this.isInitialized = true;
    logger.info('回放UI初始化完成');
    return true;
  }

  /**
   * 销毁UI
   */
  public destroy(): void {
    if (!this.isInitialized) {
      return;
    }

    // 清除更新间隔
    if (this.updateInterval !== null) {
      window.clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    // 清空容器
    if (this.container) {
      this.container.innerHTML = '';
    }

    // 重置状态
    this.isInitialized = false;
    this.container = null;
    this.controlsContainer = null;
    this.timelineContainer = null;
    this.infoContainer = null;
    this.eventListContainer = null;
    this.playButton = null;
    this.pauseButton = null;
    this.stopButton = null;
    this.speedSelect = null;
    this.timeSlider = null;
    this.timeDisplay = null;

    logger.info('回放UI已销毁');
  }

  /**
   * 创建UI结构
   */
  private createUIStructure(): void {
    if (!this.container) {
      return;
    }

    // 清空容器
    this.container.innerHTML = '';

    // 创建标题
    const title = document.createElement('h2');
    title.textContent = '战斗回放';
    this.container.appendChild(title);

    // 创建控制区域
    this.controlsContainer = document.createElement('div');
    this.controlsContainer.className = 'replay-controls';
    this.container.appendChild(this.controlsContainer);

    // 创建播放按钮
    this.playButton = document.createElement('button');
    this.playButton.textContent = '播放';
    this.controlsContainer.appendChild(this.playButton);

    // 创建暂停按钮
    this.pauseButton = document.createElement('button');
    this.pauseButton.textContent = '暂停';
    this.controlsContainer.appendChild(this.pauseButton);

    // 创建停止按钮
    this.stopButton = document.createElement('button');
    this.stopButton.textContent = '停止';
    this.controlsContainer.appendChild(this.stopButton);

    // 创建速度选择器
    const speedLabel = document.createElement('label');
    speedLabel.textContent = '速度: ';
    this.controlsContainer.appendChild(speedLabel);

    this.speedSelect = document.createElement('select');
    const speeds = [0.5, 1.0, 1.5, 2.0, 3.0, 5.0];
    speeds.forEach(speed => {
      const option = document.createElement('option');
      option.value = speed.toString();
      option.textContent = `${speed}x`;
      if (speed === 1.0) {
        option.selected = true;
      }
      this.speedSelect?.appendChild(option);
    });
    this.controlsContainer.appendChild(this.speedSelect);

    // 创建时间轴区域
    this.timelineContainer = document.createElement('div');
    this.timelineContainer.className = 'replay-timeline';
    this.container.appendChild(this.timelineContainer);

    // 创建时间滑块
    this.timeSlider = document.createElement('input');
    this.timeSlider.type = 'range';
    this.timeSlider.min = '0';
    this.timeSlider.max = '100';
    this.timeSlider.value = '0';
    this.timeSlider.className = 'replay-time-slider';
    this.timelineContainer.appendChild(this.timeSlider);

    // 创建时间显示
    this.timeDisplay = document.createElement('div');
    this.timeDisplay.className = 'replay-time-display';
    this.timeDisplay.textContent = '00:00 / 00:00';
    this.timelineContainer.appendChild(this.timeDisplay);

    // 创建信息区域
    this.infoContainer = document.createElement('div');
    this.infoContainer.className = 'replay-info';
    this.container.appendChild(this.infoContainer);

    // 创建事件列表区域
    this.eventListContainer = document.createElement('div');
    this.eventListContainer.className = 'replay-event-list';
    this.container.appendChild(this.eventListContainer);

    // 添加样式
    this.addStyles();
  }

  /**
   * 添加样式
   */
  private addStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .replay-controls {
        margin: 10px 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .replay-controls button {
        padding: 5px 10px;
        cursor: pointer;
      }
      
      .replay-timeline {
        margin: 10px 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .replay-time-slider {
        flex: 1;
      }
      
      .replay-time-display {
        min-width: 100px;
        text-align: right;
      }
      
      .replay-info {
        margin: 10px 0;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
      }
      
      .replay-event-list {
        margin: 10px 0;
        max-height: 300px;
        overflow-y: auto;
        border: 1px solid #ccc;
        border-radius: 5px;
        padding: 10px;
      }
      
      .replay-event {
        padding: 5px;
        margin: 5px 0;
        border-bottom: 1px solid #eee;
      }
      
      .replay-event-time {
        font-weight: bold;
        margin-right: 10px;
      }
      
      .replay-event-type {
        color: #666;
        margin-right: 10px;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 绑定事件
   */
  private bindEvents(): void {
    // 播放按钮
    this.playButton?.addEventListener('click', () => {
      const state = this.battleEngine.getReplayState();
      if (state === ReplayState.IDLE) {
        this.battleEngine.startReplay();
      } else if (state === ReplayState.PAUSED) {
        this.battleEngine.resumeReplay();
      }
    });

    // 暂停按钮
    this.pauseButton?.addEventListener('click', () => {
      this.battleEngine.pauseReplay();
    });

    // 停止按钮
    this.stopButton?.addEventListener('click', () => {
      this.battleEngine.stopReplay();
    });

    // 速度选择器
    this.speedSelect?.addEventListener('change', () => {
      const speed = parseFloat(this.speedSelect?.value || '1.0');
      this.battleEngine.setReplaySpeed(speed);
    });

    // 时间滑块
    this.timeSlider?.addEventListener('input', () => {
      const percent = parseFloat(this.timeSlider?.value || '0');
      const totalDuration = this.battleEngine.getReplayTotalDuration();
      const time = (percent / 100) * totalDuration;
      this.battleEngine.seekToTime(time);
    });

    // 设置回放事件回调
    this.battleEngine.setReplayEventCallback(event => {
      this.addEventToList(event);
    });

    // 设置回放状态回调
    this.battleEngine.setReplayStateCallback(state => {
      this.updateControlsState(state);
    });
  }

  /**
   * 更新UI
   */
  private updateUI(): void {
    if (!this.isInitialized) {
      return;
    }

    // 获取当前回放状态
    const state = this.battleEngine.getReplayState();
    const currentTime = this.battleEngine.getReplayCurrentTime();
    const totalDuration = this.battleEngine.getReplayTotalDuration();

    // 更新时间显示
    if (this.timeDisplay) {
      this.timeDisplay.textContent = `${this.formatTime(currentTime)} / ${this.formatTime(totalDuration)}`;
    }

    // 更新时间滑块
    if (this.timeSlider && totalDuration > 0) {
      const percent = (currentTime / totalDuration) * 100;
      this.timeSlider.value = percent.toString();
    }

    // 更新控制按钮状态
    this.updateControlsState(state);

    // 更新信息区域
    this.updateInfoArea();
  }

  /**
   * 更新控制按钮状态
   * @param state 回放状态
   */
  private updateControlsState(state: ReplayState): void {
    if (!this.isInitialized) {
      return;
    }

    // 更新播放按钮
    if (this.playButton) {
      this.playButton.disabled = state === ReplayState.PLAYING || state === ReplayState.COMPLETED;
    }

    // 更新暂停按钮
    if (this.pauseButton) {
      this.pauseButton.disabled = state !== ReplayState.PLAYING;
    }

    // 更新停止按钮
    if (this.stopButton) {
      this.stopButton.disabled = state === ReplayState.IDLE || state === ReplayState.COMPLETED;
    }

    // 更新速度选择器
    if (this.speedSelect) {
      this.speedSelect.disabled = state === ReplayState.IDLE || state === ReplayState.COMPLETED;
    }

    // 更新时间滑块
    if (this.timeSlider) {
      this.timeSlider.disabled = state === ReplayState.IDLE;
    }
  }

  /**
   * 更新信息区域
   */
  private updateInfoArea(): void {
    if (!this.isInitialized || !this.infoContainer) {
      return;
    }

    // 获取回放数据
    const replayData = this.battleEngine.getReplayData();
    if (!replayData) {
      this.infoContainer.innerHTML = '<p>没有回放数据</p>';
      return;
    }

    // 更新信息
    this.infoContainer.innerHTML = `
      <h3>回放信息</h3>
      <p><strong>ID:</strong> ${replayData.replayId}</p>
      <p><strong>章节:</strong> ${replayData.metadata.chapter}-${replayData.metadata.stage}</p>
      <p><strong>玩家:</strong> ${replayData.metadata.players.join(', ')}</p>
      <p><strong>时长:</strong> ${this.formatTime(replayData.metadata.battleDuration)}</p>
      <p><strong>事件数:</strong> ${replayData.events?.length || 0}</p>
      <p><strong>指令数:</strong> ${replayData.commands?.length || 0}</p>
    `;
  }

  /**
   * 添加事件到列表
   * @param event 回放事件
   */
  private addEventToList(event: any): void {
    if (!this.isInitialized || !this.eventListContainer) {
      return;
    }

    // 创建事件元素
    const eventElement = document.createElement('div');
    eventElement.className = 'replay-event';

    // 创建时间元素
    const timeElement = document.createElement('span');
    timeElement.className = 'replay-event-time';
    timeElement.textContent = this.formatTime(event.time);
    eventElement.appendChild(timeElement);

    // 创建类型元素
    const typeElement = document.createElement('span');
    typeElement.className = 'replay-event-type';
    typeElement.textContent = event.type;
    eventElement.appendChild(typeElement);

    // 创建数据元素
    const dataElement = document.createElement('span');
    dataElement.className = 'replay-event-data';
    dataElement.textContent = this.formatEventData(event);
    eventElement.appendChild(dataElement);

    // 添加到列表
    this.eventListContainer.appendChild(eventElement);

    // 滚动到底部
    this.eventListContainer.scrollTop = this.eventListContainer.scrollHeight;
  }

  /**
   * 格式化事件数据
   * @param event 回放事件
   * @returns 格式化后的事件数据
   */
  private formatEventData(event: any): string {
    switch (event.type) {
      case 'battleStart':
        return '战斗开始';
      case 'battleEnd':
        return `战斗结束，结果: ${event.data?.result || '未知'}`;
      case 'entityDeath':
        return `实体死亡: ${event.data?.entity?.id || '未知'}`;
      case 'damageDealt':
        return `伤害: ${event.data?.amount || 0}`;
      case 'skillCast':
        return `技能释放: ${event.data?.skillName || event.data?.skillId || '未知'}`;
      case 'waveStart':
        return `波次开始: ${(event.data?.waveIndex || 0) + 1}`;
      case 'waveCompleted':
        return `波次完成: ${(event.data?.waveIndex || 0) + 1}`;
      default:
        return JSON.stringify(event.data);
    }
  }

  /**
   * 格式化时间
   * @param ms 毫秒
   * @returns 格式化后的时间字符串
   */
  private formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
