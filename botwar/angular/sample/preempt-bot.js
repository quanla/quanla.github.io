function Bot() {
    this.run = function (control) {
        var enemies = control.getEnemies();
        if (Cols.isEmpty(enemies)) {
            return; // Relax, no one around
        }

        var minDisE = Cols.findMin(enemies, function(enemy) {
            return Distance.between(control.position, enemy.position);
        });

        control.setDirection(minDisE.position);
        if (Distance.between(control.position, minDisE.position) < 70) {
            control.fight();
        } else {
            control.stand();
        }
    };
}