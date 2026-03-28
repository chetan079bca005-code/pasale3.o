from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_usersettings_userprofile_photo'),
    ]

    operations = [
        migrations.AddField(
            model_name='party',
            name='photo',
            field=models.TextField(blank=True, null=True),
        ),
    ]
