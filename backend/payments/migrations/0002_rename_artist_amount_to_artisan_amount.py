# Generated migration to rename artist_amount to artisan_amount

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='payment',
            old_name='artist_amount',
            new_name='artisan_amount',
        ),
    ]

