function Bot() {
    this.run = function (control) {
        var enemies = control.getEnemies();
        if (Cols.isEmpty(enemies)) {
            control.stand();
            return; // Relax, we won
        }

        var minDisE = Cols.findMin(enemies, function(enemy) {
            return Distance.between(control.position, enemy.position);
        });

        control.setDirection(minDisE.position);

        if (Distance.between(control.position, minDisE.position) > 40) {
            control.goForward();
        } else {
            control.fight();
        }
    };
}