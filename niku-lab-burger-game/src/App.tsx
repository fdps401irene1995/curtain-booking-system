import React from 'react';
import BurgerGame from './game/BurgerGame';

export default function App() {
  return (
    <div className="container">
      <div className="appShell">
        <div>
          <div className="brand" aria-label="日肉研所 NIKU LAB">
            <div className="brand-cn">日肉研所</div>
            <div className="brand-en">NIKU LAB</div>
          </div>
          <p className="subtitle">為每天訓練，準備的一塊好肉</p>
        </div>

        <BurgerGame />

        <p className="subtitle">
          遊戲規則：15 秒內把肉排「丟進」漢堡有效範圍才算一層；超出範圍不計分。
        </p>
      </div>
    </div>
  );
}
